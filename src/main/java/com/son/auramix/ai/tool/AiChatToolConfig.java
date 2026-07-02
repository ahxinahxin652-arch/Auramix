package com.son.auramix.ai.tool;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.domain.entity.PlaybackHistory;
import com.son.auramix.domain.entity.Track;
import com.son.auramix.domain.entity.UserProfile;
import com.son.auramix.mapper.PlaybackHistoryMapper;
import com.son.auramix.mapper.TrackMapper;
import com.son.auramix.mapper.UserProfileMapper;
import com.son.auramix.service.user.PlaylistService;
import com.son.auramix.security.user.UserPrincipal;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class AiChatToolConfig {

    private final UserProfileMapper userProfileMapper;
    private final PlaylistService playlistService;
    private final TrackMapper trackMapper;
    private final PlaybackHistoryMapper playbackHistoryMapper;
    private final com.son.auramix.mapper.GenreMapper genreMapper;
    private final com.son.auramix.mapper.TrackGenreMapper trackGenreMapper;
    private final com.son.auramix.mapper.PlaylistMapper playlistMapper;
    private final com.son.auramix.mapper.PlaylistTrackMapper playlistTrackMapper;
    private final com.son.auramix.service.user.UserTrackService userTrackService;

    public AiChatToolConfig(UserProfileMapper userProfileMapper, 
                            PlaylistService playlistService, 
                            TrackMapper trackMapper,
                            PlaybackHistoryMapper playbackHistoryMapper,
                            com.son.auramix.mapper.GenreMapper genreMapper,
                            com.son.auramix.mapper.TrackGenreMapper trackGenreMapper,
                            com.son.auramix.mapper.PlaylistMapper playlistMapper,
                            com.son.auramix.mapper.PlaylistTrackMapper playlistTrackMapper,
                            com.son.auramix.service.user.UserTrackService userTrackService) {
        this.userProfileMapper = userProfileMapper;
        this.playlistService = playlistService;
        this.trackMapper = trackMapper;
        this.playbackHistoryMapper = playbackHistoryMapper;
        this.genreMapper = genreMapper;
        this.trackGenreMapper = trackGenreMapper;
        this.playlistMapper = playlistMapper;
        this.playlistTrackMapper = playlistTrackMapper;
        this.userTrackService = userTrackService;
    }

    private void emitToolEvent(String event) {
        reactor.core.publisher.Sinks.Many<String> sink = ToolEventSinkAccessor.SINK.get();
        if (sink != null) {
            sink.tryEmitNext(event);
        }
    }

    // Helper to get current user securely
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        throw new BusinessException(com.son.auramix.common.result.ResultCode.UNAUTHORIZED);
    }
    // 1. UpdateUserProfileTool
    public record UpdateProfileRequest(
            @JsonProperty("favoriteGenres") String favoriteGenres, 
            @JsonProperty("favoriteArtists") String favoriteArtists, 
            @JsonProperty("summary") String summary) {}
    
    @Bean
    @Description("Updates the user's music profile/preferences based on their chat input.")
    public Function<UpdateProfileRequest, String> updateUserProfileTool() {
        return request -> {
            emitToolEvent("\n<Action>正在更新您的偏好数据...</Action>");
            System.out.println("========== [TOOL CALL] updateUserProfileTool invoked ==========");
            System.out.println("Request: " + request);
            
            Long userId;
            try {
                userId = getCurrentUserId();
            } catch (BusinessException e) {
                System.out.println("Tool returning error: User not authenticated.");
                emitToolEvent("\n<ToolResult>更新失败: 未登录</ToolResult>\n");
                return "Error: User not authenticated.";
            }
            System.out.println("Current UserId resolved as: " + userId);
            
            try {
                UserProfile profile = userProfileMapper.selectById(userId);
                if (profile == null) {
                    profile = new UserProfile();
                    profile.setUserId(userId);
                    profile.setFavoriteGenres(request.favoriteGenres());
                    profile.setFavoriteArtists(request.favoriteArtists());
                    profile.setSummary(request.summary());
                    profile.setCreatedAt(LocalDateTime.now());
                    userProfileMapper.insert(profile);
                    System.out.println("Inserted new user profile.");
                } else {
                    if (StringUtils.hasText(request.favoriteGenres())) profile.setFavoriteGenres(request.favoriteGenres());
                    if (StringUtils.hasText(request.favoriteArtists())) profile.setFavoriteArtists(request.favoriteArtists());
                    if (StringUtils.hasText(request.summary())) profile.setSummary(request.summary());
                    userProfileMapper.updateById(profile);
                    log.info("Updated existing user profile: {}", profile);
                }
                String result = "Success: User profile updated.";
                emitToolEvent("\n<ToolResult><Summary>更新结果: 偏好更新成功</Summary><Details>" + result + "</Details></ToolResult>\n");
                return result;
            } catch (Exception e) {
                log.error("Exception in updateUserProfileTool: {}", e.getMessage(), e);
                emitToolEvent("\n<ToolResult><Summary>更新失败</Summary><Details>" + e.getMessage() + "</Details></ToolResult>\n");
                return "Error updating user profile: " + e.getMessage();
            }
        };
    }

    // 2. ReadUserProfileTool
    public record ReadProfileRequest() {}
    
    @Bean
    @Description("Reads the current user's music profile/preferences.")
    public Function<ReadProfileRequest, String> readUserProfileTool() {
        return request -> {
            emitToolEvent("\n<Action>正在读取您的偏好数据...</Action>");
            try {
                Long userId = getCurrentUserId();
                UserProfile profile = userProfileMapper.selectById(userId);
                if (profile == null) {
                    log.info("readUserProfileTool result: No profile found for userId {}", userId);
                    String result = "No user profile found. Please ask the user about their preferences.";
                    emitToolEvent("\n<ToolResult><Summary>获取结果: 暂无偏好数据</Summary><Details>" + result + "</Details></ToolResult>\n");
                    return result;
                }
                String result = String.format("Favorite Genres: %s, Favorite Artists: %s, Summary: %s", 
                    profile.getFavoriteGenres(), profile.getFavoriteArtists(), profile.getSummary());
                log.info("readUserProfileTool result for userId {}: {}", userId, result);
                emitToolEvent("\n<ToolResult><Summary>获取结果: 成功读取偏好数据</Summary><Details>" + result + "</Details></ToolResult>\n");
                return result;
            } catch (Exception e) {
                log.error("Exception in readUserProfileTool: {}", e.getMessage(), e);
                emitToolEvent("\n<ToolResult>读取失败: " + e.getMessage() + "</ToolResult>\n");
                return "Error reading user profile: " + e.getMessage();
            }
        };
    }

    // 3. SearchSongsByGenreTool
    public record SearchSongsRequest(
            @JsonProperty("keyword") String keyword, 
            @JsonProperty("limit") int limit) {}
    
    @Bean
    @Description("Searches for songs by keyword or genre. Returns a plaintext list of matching songs.")
    public Function<SearchSongsRequest, String> searchSongsByGenreTool() {
        return request -> {
            emitToolEvent("\n<Action>正在根据关键字搜索歌曲: " + request.keyword() + "</Action>");
            try {
                int limit = request.limit() > 0 ? request.limit() : 5;
                String keyword = request.keyword() != null ? request.keyword() : "";
                
                // 1. Find genres by keyword
                LambdaQueryWrapper<com.son.auramix.domain.entity.Genre> genreQw = new LambdaQueryWrapper<>();
                genreQw.like(com.son.auramix.domain.entity.Genre::getName, keyword);
                List<com.son.auramix.domain.entity.Genre> genres = genreMapper.selectList(genreQw);
                List<Long> genreIds = genres.stream().map(com.son.auramix.domain.entity.Genre::getId).toList();
                
                // 2. Find track IDs by genre
                List<Long> trackIds = new java.util.ArrayList<>();
                if (!genreIds.isEmpty()) {
                    LambdaQueryWrapper<com.son.auramix.domain.entity.TrackGenre> tgQw = new LambdaQueryWrapper<>();
                    tgQw.in(com.son.auramix.domain.entity.TrackGenre::getGenreId, genreIds);
                    List<com.son.auramix.domain.entity.TrackGenre> tgs = trackGenreMapper.selectList(tgQw);
                    trackIds.addAll(tgs.stream().map(com.son.auramix.domain.entity.TrackGenre::getTrackId).toList());
                }
                
                // 3. Find tracks by title OR by genre-associated track IDs
                LambdaQueryWrapper<Track> wrapper = new LambdaQueryWrapper<>();
                wrapper.like(Track::getTitle, keyword);
                if (!trackIds.isEmpty()) {
                    wrapper.or().in(Track::getId, trackIds);
                }
                wrapper.last("LIMIT " + Math.min(limit, 20));
                
                List<Track> tracks = trackMapper.selectList(wrapper);
                
                if (tracks.isEmpty()) {
                    String res = "No songs found for: " + keyword;
                    emitToolEvent("\n<ToolResult><Summary>搜索结果: 未找到匹配歌曲</Summary><Details>" + res + "</Details></ToolResult>\n");
                    return res;
                }
                
                String resultText = tracks.stream()
                    .map(t -> {
                        try {
                            com.son.auramix.domain.vo.user.UserTrackDetailVO detail = userTrackService.getTrackDetail(t.getId());
                            String artists = detail.getArtists() != null ? 
                                detail.getArtists().stream().map(a -> a.getName()).collect(Collectors.joining(", ")) : "Unknown";
                            String genresList = detail.getGenres() != null ? 
                                detail.getGenres().stream().map(g -> g.getName()).collect(Collectors.joining(", ")) : "Unknown";
                            return String.format("id: %d, title: %s, artists: %s, genres: %s, cover: %s", 
                                detail.getId(), 
                                detail.getTitle() != null ? detail.getTitle() : "Unknown",
                                artists,
                                genresList,
                                detail.getCoverUrl() != null ? detail.getCoverUrl() : "null");
                        } catch (Exception ex) {
                            return String.format("id: %d, title: %s, artists: Unknown, genres: Unknown, cover: null", 
                                t.getId(), t.getTitle() != null ? t.getTitle() : "Unknown");
                        }
                    })
                    .collect(Collectors.joining("\n"));
                
                log.info("searchSongsByGenreTool result for keyword '{}': found {} tracks. Data: \n{}", keyword, tracks.size(), resultText);
                emitToolEvent("\n<ToolResult><Summary>搜索结果: 找到 " + tracks.size() + " 首歌曲</Summary><Details>\n" + resultText + "\n</Details></ToolResult>\n");
                return resultText;
            } catch (Exception e) {
                log.error("Exception in searchSongsByGenreTool: {}", e.getMessage(), e);
                emitToolEvent("\n<ToolResult><Summary>搜索失败</Summary><Details>" + e.getMessage() + "</Details></ToolResult>\n");
                return "Error searching songs: " + e.getMessage();
            }
        };
    }

    // 4. GetRecentPlaybackAndGenresTool
    public record RecentPlaybackRequest(
            @JsonProperty("limit") int limit) {}
    
    @Bean
    @Description("Gets the user's recently played songs to analyze their current mood/taste.")
    public Function<RecentPlaybackRequest, String> getRecentPlaybackAndGenresTool() {
        return request -> {
            emitToolEvent("\n<Action>正在读取您的最近播放记录...</Action>");
            try {
                Long userId = getCurrentUserId();
                
                int limit = request.limit() > 0 ? request.limit() : 10;
                LambdaQueryWrapper<PlaybackHistory> hw = new LambdaQueryWrapper<>();
                hw.eq(PlaybackHistory::getUserId, userId)
                  .orderByDesc(PlaybackHistory::getPlayedAt)
                  .last("LIMIT " + limit);
                  
                List<PlaybackHistory> history = playbackHistoryMapper.selectList(hw);
                if(history.isEmpty()) {
                    String res = "No recent play history.";
                    emitToolEvent("\n<ToolResult><Summary>读取结果: 暂无播放记录</Summary><Details>" + res + "</Details></ToolResult>\n");
                    return res;
                }
                
                List<Long> trackIds = history.stream().map(PlaybackHistory::getTrackId).distinct().toList();
                if (trackIds.isEmpty()) {
                    String res = "No recent play history.";
                    emitToolEvent("\n<ToolResult><Summary>读取结果: 暂无播放记录</Summary><Details>" + res + "</Details></ToolResult>\n");
                    return res;
                }
                
                List<Track> tracks = trackMapper.selectBatchIds(trackIds);
                
                String resultText = tracks.stream()
                    .map(t -> {
                        try {
                            com.son.auramix.domain.vo.user.UserTrackDetailVO detail = userTrackService.getTrackDetail(t.getId());
                            String artists = detail.getArtists() != null ? 
                                detail.getArtists().stream().map(a -> a.getName()).collect(Collectors.joining(", ")) : "Unknown";
                            String genresList = detail.getGenres() != null ? 
                                detail.getGenres().stream().map(g -> g.getName()).collect(Collectors.joining(", ")) : "Unknown";
                            return String.format("id: %d, title: %s, artists: %s, genres: %s, cover: %s", 
                                detail.getId(), 
                                detail.getTitle() != null ? detail.getTitle() : "Unknown",
                                artists,
                                genresList,
                                detail.getCoverUrl() != null ? detail.getCoverUrl() : "null");
                        } catch (Exception ex) {
                            return String.format("id: %d, title: %s, artists: Unknown, genres: Unknown, cover: null", 
                                t.getId(), t.getTitle() != null ? t.getTitle() : "Unknown");
                        }
                    })
                    .collect(Collectors.joining("\n"));
                
                log.info("getRecentPlaybackAndGenresTool result for userId '{}': found {} tracks. Data: \n{}", userId, tracks.size(), resultText);
                emitToolEvent("\n<ToolResult><Summary>读取结果: 找到 " + tracks.size() + " 首最近播放歌曲</Summary><Details>\n" + resultText + "\n</Details></ToolResult>\n");
                return resultText;
            } catch (Exception e) {
                log.error("Exception in getRecentPlaybackAndGenresTool: {}", e.getMessage(), e);
                emitToolEvent("\n<ToolResult><Summary>读取失败</Summary><Details>" + e.getMessage() + "</Details></ToolResult>\n");
                return "Error retrieving recent playback: " + e.getMessage();
            }
        };
    }

    // 5. CreatePlaylistAndAddSongsTool
    public record CreatePlaylistRequest(
            @JsonProperty("playlistName") String playlistName, 
            @JsonProperty("description") String description, 
            @JsonProperty("trackIds") List<Long> trackIds) {}
    
    @Bean
    @Description("Creates a new playlist for the user and adds the specified songs to it.")
    public Function<CreatePlaylistRequest, String> createPlaylistAndAddSongsTool() {
        return request -> {
            emitToolEvent("\n<Action>正在为您创建专属歌单: " + request.playlistName() + "</Action>");
            try {
                Long userId = getCurrentUserId();
                
                com.son.auramix.domain.entity.Playlist playlist = new com.son.auramix.domain.entity.Playlist();
                playlist.setOwnerId(userId);
                playlist.setName(request.playlistName());
                playlist.setDescription(request.description());
                playlist.setIsPublic(false);
                playlist.setCreatedAt(LocalDateTime.now());
                playlistMapper.insert(playlist);
                
                if (request.trackIds() != null && !request.trackIds().isEmpty()) {
                    for (int i = 0; i < request.trackIds().size(); i++) {
                        com.son.auramix.domain.entity.PlaylistTrack pt = new com.son.auramix.domain.entity.PlaylistTrack();
                        pt.setPlaylistId(playlist.getId());
                        pt.setTrackId(request.trackIds().get(i));
                        pt.setSortOrder(i);
                        pt.setAddedAt(LocalDateTime.now());
                        playlistTrackMapper.insert(pt);
                    }
                }
                String resultStr = String.format("Successfully created playlist: id=%d, name='%s'", playlist.getId(), playlist.getName());
                log.info("createPlaylistAndAddSongsTool result: added {} tracks. Data: {}", request.trackIds() != null ? request.trackIds().size() : 0, resultStr);
                emitToolEvent("\n<ToolResult><Summary>创建结果: 成功创建歌单并添加了 " + (request.trackIds() != null ? request.trackIds().size() : 0) + " 首歌曲</Summary><Details>" + resultStr + "</Details></ToolResult>\n");
                emitToolEvent("\n[Playlist: id=" + playlist.getId() + ", name=" + playlist.getName() + "]\n");
                return resultStr;
            } catch (Exception e) {
                log.error("Exception in createPlaylistAndAddSongsTool: {}", e.getMessage(), e);
                emitToolEvent("\n<ToolResult>创建失败: " + e.getMessage() + "</ToolResult>\n");
                return "Error creating playlist: " + e.getMessage();
            }
        };
    }
}
