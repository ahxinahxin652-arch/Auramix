package com.son.auramix.controller.admin;
import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.OssPolicyResponse;
import com.son.auramix.service.oss.OssService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/admin/manage/oss")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN') or hasAuthority('ADMIN')")
public class OssController {
    private final OssService ossService;

    @GetMapping("/policy")
    public Result<OssPolicyResponse> getPostPolicy(@RequestParam String type) {
        if (!"audio".equals(type) && !"video".equals(type) && !"image".equals(type) && !"lyrics".equals(type) && !"cover".equals(type)) {
            throw new com.son.auramix.common.exception.BusinessException(com.son.auramix.common.result.ResultCode.BAD_REQUEST, "Invalid upload type");
        }
        String dateDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String dir = type + "/" + dateDir + "/";
        return Result.success(ossService.generatePostPolicy(dir));
    }
}
