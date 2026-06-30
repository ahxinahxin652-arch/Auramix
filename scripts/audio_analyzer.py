"""
音乐音频特征分析脚本
使用 librosa 提取 track_audio_features 表所需的所有字段

用法：
    python audio_analyzer.py <audio_file_path>

输出：JSON 格式的特征数据（stdout）
"""

import sys
import json
import warnings
import numpy as np

warnings.filterwarnings("ignore")

try:
    import librosa
    import librosa.display
except ImportError:
    print(json.dumps({"error": "librosa 未安装，请执行: pip install librosa"}))
    sys.exit(1)

# ============================================================
# 配置
# ============================================================
SAMPLE_RATE = 22050          # 采样率
DURATION_LIMIT = 60          # 只分析前 60 秒（平衡精度与速度）
MFCC_N_MFCC = 20             # MFCC 维度
FFT_WINDOW = 2048
HOP_LENGTH = 512

# 12 个调性名称
KEY_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


def load_audio(file_path):
    """加载音频文件，返回 y, sr"""
    try:
        y, sr = librosa.load(file_path, sr=SAMPLE_RATE, mono=True, duration=DURATION_LIMIT)
        return y, sr
    except Exception as e:
        raise RuntimeError(f"无法加载音频文件 '{file_path}': {e}")


# ============================================================
# 基础音频特征
# ============================================================

def extract_tempo(y, sr):
    """提取速度 BPM"""
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo = librosa.feature.tempo(onset_envelope=onset_env, sr=sr)
    return round(float(np.mean(tempo)), 2)


def extract_key_and_mode(y, sr):
    """
    提取调性和调式
    使用 Krumhansl-Kessler 调性分析（librosa 内置）
    """
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)  # 12 维平均 chroma

    # 标准大调/小调模板
    major_template = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09,
                                2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
    minor_template = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53,
                                2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

    best_key = 0
    best_mode = 0   # 0=大调, 1=小调
    best_score = -np.inf

    for key in range(12):
        # 大调评分
        rolled_major = np.roll(major_template, key)
        score_major = np.corrcoef(chroma_mean, rolled_major)[0, 1]
        if score_major > best_score:
            best_score = score_major
            best_key = key
            best_mode = 0

        # 小调评分
        rolled_minor = np.roll(minor_template, key)
        score_minor = np.corrcoef(chroma_mean, rolled_minor)[0, 1]
        if score_minor > best_score:
            best_score = score_minor
            best_key = key
            best_mode = 1

    return best_key, best_mode


def extract_time_signature(y, sr):
    """
    估计拍号
    通过节拍跟踪分析强拍间隔，推断常见的 3/4, 4/4, 6/8 等
    """
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo = librosa.feature.tempo(onset_envelope=onset_env, sr=sr)
    tempo_val = float(np.mean(tempo))

    # 获取节拍帧
    _, beats = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)
    if len(beats) < 4:
        return 4  # 默认为 4/4

    # 节拍间隔（帧数）
    beat_intervals = np.diff(beats)

    # 使用自相关分析拍子分组
    # 简化方案：根据 BPM 范围和节拍间隔分布做推断
    median_interval = np.median(beat_intervals)

    # 通过强弱拍模式推断拍号
    # 统计节拍间隔的模分布
    intervals_mean = np.mean(beat_intervals)

    # 较长的间隔模式可能表示复合拍
    cv = np.std(beat_intervals) / (intervals_mean + 1e-6)

    if cv < 0.35:
        # 稳定的节奏
        if tempo_val < 60:
            return 3   # 可能 3/4
        else:
            return 4   # 可能 4/4
    else:
        # 不稳定的节奏
        if tempo_val > 150:
            return 6   # 可能 6/8 或快速复合拍
        return 4


# ============================================================
# 情感与感知特征
# ============================================================

def extract_spectral_features(y, sr):
    """提取频谱相关的基础特征"""
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr).flatten()
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr, roll_percent=0.85).flatten()
    spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr).flatten()
    zero_crossing_rate = librosa.feature.zero_crossing_rate(y).flatten()
    spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
    spectral_flatness = librosa.feature.spectral_flatness(y=y).flatten()

    rms = librosa.feature.rms(y=y).flatten()

    return {
        "spectral_centroid_mean": float(np.mean(spectral_centroid)),
        "spectral_rolloff_mean": float(np.mean(spectral_rolloff)),
        "spectral_bandwidth_mean": float(np.mean(spectral_bandwidth)),
        "zero_crossing_rate_mean": float(np.mean(zero_crossing_rate)),
        "spectral_contrast_mean": float(np.mean(spectral_contrast)),
        "spectral_flatness_mean": float(np.mean(spectral_flatness)),
        "rms_mean": float(np.mean(rms)),
        "rms_std": float(np.std(rms)),
    }


def estimate_energy(rms_mean, spectral_flatness_mean):
    """
    能量值 (0.000~1.000)
    基于 RMS 响度 + 频谱平坦度（噪音占比）
    RMS 归一化到 0~1，然后与 flatness 加权
    """
    # RMS 归一化：以经验值 0.2 为满幅
    rms_norm = min(rms_mean / 0.2, 1.0)

    # flatness 越高 = 越像噪音 = 降低能量分
    flatness_penalty = 1.0 - spectral_flatness_mean

    energy = 0.6 * rms_norm + 0.4 * flatness_penalty
    return round(max(0.0, min(1.0, energy)), 3)


def estimate_valence(musical_mode, spectral_centroid_mean, tempo_val, energy_val):
    """
    愉悦度 (0.000~1.000)
    模型：大调/小调 + 频谱质心 + 速度 + 能量
    大调(明亮)、高频谱质心、较高速度 → 高愉悦度
    """
    # 调式得分：大调=1, 小调=0
    mode_score = 1.0 if musical_mode == 0 else 0.3

    # 频谱质心归一化（3000Hz 为高亮）
    centroid_score = min(spectral_centroid_mean / 3000.0, 1.0)

    # 速度归一化（120 BPM 为中心）
    tempo_score = 1.0 / (1.0 + np.exp(-0.05 * (tempo_val - 100)))

    valence = 0.35 * mode_score + 0.20 * centroid_score + 0.25 * tempo_score + 0.20 * energy_val
    return round(max(0.0, min(1.0, valence)), 3)


def estimate_arousal(energy_val, tempo_val, rms_std, spectral_contrast_mean):
    """
    唤醒度 (0.000~1.000)
    高能量 + 高速度 + 高动态范围 → 高唤醒度
    """
    tempo_score = min(tempo_val / 180.0, 1.0)
    rms_volatility = min(rms_std / 0.05, 1.0)
    contrast_norm = min(spectral_contrast_mean / 25.0, 1.0)

    arousal = 0.35 * energy_val + 0.30 * tempo_score + 0.20 * rms_volatility + 0.15 * contrast_norm
    return round(max(0.0, min(1.0, arousal)), 3)


def estimate_danceability(tempo_val, beat_strengths, spectral_flatness_mean):
    """
    舞曲感 (0.000~1.000)
    基于节拍强度稳定性 + 速度是否在舞曲范围(90~130) + 节奏清晰度
    """
    # 速度适配度：90~130 BPM 为舞曲黄金区间
    if 90 <= tempo_val <= 130:
        tempo_fit = 1.0 - abs(tempo_val - 110) / 40.0
    elif tempo_val < 90:
        tempo_fit = tempo_val / 90.0
    else:
        tempo_fit = max(0.0, 1.0 - (tempo_val - 130) / 50.0)

    # 节拍强度
    beat_strength = np.mean(beat_strengths) if len(beat_strengths) > 0 else 0.3
    beat_strength_norm = min(beat_strength / 3.0, 1.0)

    # 节拍规律性（局部自相关）
    if len(beat_strengths) > 2:
        local_cv = np.std(beat_strengths) / (np.mean(beat_strengths) + 1e-6)
        regularity = max(0.0, 1.0 - local_cv * 2)
    else:
        regularity = 0.5

    # flatness 越低 = 越清晰 = 越适合舞蹈
    clarity = 1.0 - spectral_flatness_mean

    dance = 0.25 * tempo_fit + 0.30 * beat_strength_norm + 0.25 * regularity + 0.20 * clarity
    return round(max(0.0, min(1.0, dance)), 3)


def estimate_acousticness(spectral_rolloff_mean, zero_crossing_rate_mean,
                          spectral_centroid_mean, spectral_flatness_mean):
    """
    原声程度 (0.000~1.000)
    低频谱滚降 + 低过零率 + 低频谱质心 + 高频谱平坦度 → 高原声
    """
    # 低 rolloff = 原声（原声乐器高频少）
    rolloff_score = 1.0 - min(spectral_rolloff_mean / 8000.0, 1.0)

    # 低 ZCR = 原声
    zcr_score = 1.0 - min(zero_crossing_rate_mean / 0.15, 1.0)

    # 低 centroid = 原声
    centroid_score = 1.0 - min(spectral_centroid_mean / 4000.0, 1.0)

    # 高 flatness = 噪音/电子
    flatness_score = 1.0 - spectral_flatness_mean

    acoustic = 0.25 * rolloff_score + 0.25 * zcr_score + 0.25 * centroid_score + 0.25 * flatness_score
    return round(max(0.0, min(1.0, acoustic)), 3)


def estimate_instrumentalness(spectral_centroid_mean, zero_crossing_rate_mean,
                               spectral_bandwidth_mean, mfcc):
    """
    纯器乐程度 (0.000~1.000)
    高频谱质心变化 + 低频带宽度 + MFCC 低阶波动 → 无人声

    人声的频谱特征相对稳定，器乐的频谱变化更大
    """
    # MFCC 标准差（帧间变化）：器乐变化大
    mfcc_std = np.mean(np.std(mfcc, axis=1))

    # 频谱质心的帧间变化
    # centroid 已在外部计算，这里用 bandwidth 的变化
    bandwidth_norm = min(spectral_bandwidth_mean / 4000.0, 1.0)

    # ZCR 归一化
    zcr_norm = min(zero_crossing_rate_mean / 0.1, 1.0)

    # MFCC 变化大 = 器乐概率高
    mfcc_variability = min(mfcc_std / 30.0, 1.0)

    instrumental = 0.30 * (1.0 - bandwidth_norm) + 0.25 * mfcc_variability + \
                   0.25 * (1.0 - zcr_norm) + 0.20 * 0.5
    return round(max(0.0, min(1.0, instrumental)), 3)


# ============================================================
# MFCC 向量
# ============================================================

def extract_mfcc(y, sr):
    """提取 MFCC 特征向量（20 维，全局均值）"""
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=MFCC_N_MFCC,
                                n_fft=FFT_WINDOW, hop_length=HOP_LENGTH)
    # 全局均值 → 20 维向量
    mfcc_mean = np.mean(mfcc, axis=1)
    # 归一化到 -1~1
    mfcc_max = np.max(np.abs(mfcc_mean))
    if mfcc_max > 0:
        mfcc_mean = mfcc_mean / mfcc_max
    return mfcc_mean


# ============================================================
# 主分析流程
# ============================================================

def analyze(file_path):
    """分析音频文件，返回完整特征字典"""
    print(f"[INFO] 加载音频: {file_path}", file=sys.stderr)

    y, sr = load_audio(file_path)
    duration = len(y) / sr

    print(f"[INFO] 采样率={sr}, 时长={duration:.1f}s", file=sys.stderr)

    # --- 提取频谱特征（共用一次 FFT） ---
    print("[INFO] 提取频谱特征...", file=sys.stderr)
    spec_feat = extract_spectral_features(y, sr)

    # --- 基础特征 ---
    print("[INFO] 提取速度...", file=sys.stderr)
    tempo = extract_tempo(y, sr)

    print("[INFO] 提取调性/调式...", file=sys.stderr)
    musical_key, musical_mode = extract_key_and_mode(y, sr)

    print("[INFO] 提取拍号...", file=sys.stderr)
    time_signature = extract_time_signature(y, sr)

    # --- 获取节拍强度 ---
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    beat_strengths = onset_env

    # --- 提取 MFCC（用于 instrumentalness 和多维特征） ---
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=MFCC_N_MFCC,
                                n_fft=FFT_WINDOW, hop_length=HOP_LENGTH)
    mfcc_vector = extract_mfcc(y, sr)

    # --- 感知特征 ---
    print("[INFO] 计算能量值...", file=sys.stderr)
    energy = estimate_energy(spec_feat["rms_mean"], spec_feat["spectral_flatness_mean"])

    print("[INFO] 计算愉悦度...", file=sys.stderr)
    valence = estimate_valence(musical_mode, spec_feat["spectral_centroid_mean"], tempo, energy)

    print("[INFO] 计算唤醒度...", file=sys.stderr)
    arousal = estimate_arousal(energy, tempo, spec_feat["rms_std"],
                               spec_feat["spectral_contrast_mean"])

    print("[INFO] 计算舞曲感...", file=sys.stderr)
    danceability = estimate_danceability(tempo, beat_strengths,
                                         spec_feat["spectral_flatness_mean"])

    print("[INFO] 计算原声程度...", file=sys.stderr)
    acousticness = estimate_acousticness(spec_feat["spectral_rolloff_mean"],
                                         spec_feat["zero_crossing_rate_mean"],
                                         spec_feat["spectral_centroid_mean"],
                                         spec_feat["spectral_flatness_mean"])

    print("[INFO] 计算纯器乐程度...", file=sys.stderr)
    instrumentalness = estimate_instrumentalness(spec_feat["spectral_centroid_mean"],
                                                  spec_feat["zero_crossing_rate_mean"],
                                                  spec_feat["spectral_bandwidth_mean"], mfcc)

    # --- 组装结果 ---
    result = {
        # 基础特征
        "tempo": tempo,
        "musical_key": musical_key,
        "musical_mode": musical_mode,
        "time_signature": time_signature,

        # 情感与感知特征
        "valence": valence,
        "arousal": arousal,
        "energy": energy,
        "danceability": danceability,
        "acousticness": acousticness,
        "instrumentalness": instrumentalness,

        # 向量特征
        "mfcc_vector": [round(float(v), 6) for v in mfcc_vector],

        # 版本
        "version": 1,

        # 调试信息
        "_meta": {
            "duration_seconds": round(duration, 2),
            "sample_rate": sr,
            "key_name": KEY_NAMES[musical_key],
            "mode_name": "大调(Major)" if musical_mode == 0 else "小调(Minor)",
            "time_signature_str": f"{time_signature}/4" if time_signature in (3, 4) else f"{time_signature}/8"
        }
    }

    return result


# ============================================================
# CLI 入口
# ============================================================

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "用法: python audio_analyzer.py <audio_file_path>"}))
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        result = analyze(file_path)
        # 输出 JSON 到 stdout
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
