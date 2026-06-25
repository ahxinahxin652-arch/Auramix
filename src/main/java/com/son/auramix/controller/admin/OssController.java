package com.son.auramix.controller.admin;

import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.OssPolicyResponse;
import com.son.auramix.service.oss.OssService;
import com.son.auramix.service.oss.OssUploadResult;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/manage/oss")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN') or hasAuthority('ADMIN')")
public class OssController {
    private final OssService ossService;

    private static final Set<String> VALID_TYPES = Set.of("audio", "video", "image", "lyrics", "cover");

    // ============================ Policy（兼容旧流程） ============================

    @GetMapping("/policy")
    public Result<OssPolicyResponse> getPostPolicy(@RequestParam String type) {
        if (!VALID_TYPES.contains(type)) {
            throw new com.son.auramix.common.exception.BusinessException(
                    com.son.auramix.common.result.ResultCode.BAD_REQUEST, "Invalid upload type");
        }
        String dateDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String dir = type + "/" + dateDir + "/";
        return Result.success(ossService.generatePostPolicy(dir));
    }

    // ============================ 后端代理上传（推荐） ============================

    /**
     * 后端代理文件上传到 OSS
     * <p>
     * 前端将文件通过 multipart/form-data 提交到此端点，
     * 后端调用 OssService.upload() 完成上传并返回签名URL。
     *
     * @param file 上传的文件（multipart）
     * @param type 文件类型: audio / video / image / lyrics / cover
     * @return 上传结果（objectKey + 签名URL + 文件大小 + eTag）
     */
    @PostMapping("/upload")
    public Result<OssUploadResult> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) throws IOException {

        if (!VALID_TYPES.contains(type)) {
            throw new com.son.auramix.common.exception.BusinessException(
                    com.son.auramix.common.result.ResultCode.BAD_REQUEST, "Invalid upload type");
        }

        String dateDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String dir = type + "/" + dateDir + "/";

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            originalFilename = "untitled";
        }

        try (InputStream inputStream = file.getInputStream()) {
            OssUploadResult result = ossService.upload(inputStream, originalFilename, dir);
            return Result.success(result);
        }
    }

    // ============================ 删除 ============================

    /**
     * 删除 OSS 上的文件
     *
     * @param objectKey OSS 对象 Key
     */
    @DeleteMapping("/object")
    public Result<Void> delete(@RequestParam String objectKey) {
        ossService.delete(objectKey);
        return Result.success();
    }
}
