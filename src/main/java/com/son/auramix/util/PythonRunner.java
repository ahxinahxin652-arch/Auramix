package com.son.auramix.util;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Python 脚本运行工具
 */
public class PythonRunner {

    private static final long TIMEOUT_SECONDS = 120;

    /**
     * 运行 Python 脚本，返回 stdout 字符串
     *
     * @param scriptPath 脚本路径
     * @param args       脚本参数
     * @return stdout 输出
     */
    public static String run(String scriptPath, String... args) throws Exception {
        ProcessBuilder pb = new ProcessBuilder("python");

        File scriptFile = new File(scriptPath);
        // 设置工作目录为脚本所在目录，命令中只传文件名
        if (scriptFile.getParentFile() != null && scriptFile.getParentFile().exists()) {
            pb.directory(scriptFile.getParentFile());
            pb.command().add(scriptFile.getName());
        } else {
            pb.command().add(scriptPath);
        }

        for (String arg : args) {
            pb.command().add(arg);
        }

        Process process = pb.start();

        // 异步消费 stderr，避免管道阻塞（不合并到 stdout，防止日志混入 JSON）
        StringBuilder stderrOutput = new StringBuilder();
        CompletableFuture<Void> stderrFuture = CompletableFuture.runAsync(() -> {
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    stderrOutput.append(line).append("\n");
                }
            } catch (Exception ignored) {
            }
        });

        // 读取 stdout（纯 JSON 输出）
        StringBuilder stdoutOutput = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                stdoutOutput.append(line).append("\n");
            }
        }

        boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("Python 脚本执行超时 (" + TIMEOUT_SECONDS + "s)");
        }

        // 等待 stderr 消费完成
        stderrFuture.get(5, TimeUnit.SECONDS);

        if (process.exitValue() != 0) {
            throw new RuntimeException("Python 脚本异常退出 (exitCode=" +
                    process.exitValue() + "): " + stderrOutput);
        }

        return stdoutOutput.toString().trim();
    }
}
