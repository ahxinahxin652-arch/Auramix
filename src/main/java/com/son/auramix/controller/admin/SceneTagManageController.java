package com.son.auramix.controller.admin;

import com.son.auramix.common.result.Result;
import com.son.auramix.domain.dto.admin.SceneTagCreateDTO;
import com.son.auramix.domain.dto.admin.SceneTagUpdateDTO;
import com.son.auramix.domain.vo.admin.SceneTagVO;
import com.son.auramix.service.admin.SceneTagManageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 场景标签管理控制器
 *
 * @author auramix
 */
@RestController
@RequestMapping("/api/admin/manage/sceneTag")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAuthority('ROOT_ADMIN') or hasAuthority('ADMIN')")
public class SceneTagManageController {

    private final SceneTagManageService sceneTagManageService;

    /**
     * 获取所有场景标签
     */
    @GetMapping("/all")
    public Result<List<SceneTagVO>> getAllSceneTags() {
        return Result.success(sceneTagManageService.getAllSceneTags());
    }

    /**
     * 新增场景标签
     */
    @PostMapping("/add")
    public Result<Void> addSceneTag(@Validated @RequestBody SceneTagCreateDTO req) {
        sceneTagManageService.addSceneTag(req);
        return Result.success();
    }

    /**
     * 更新场景标签
     */
    @PutMapping("/update/{id}")
    public Result<Void> updateSceneTag(@PathVariable Long id, @Validated @RequestBody SceneTagUpdateDTO req) {
        sceneTagManageService.updateSceneTag(id, req);
        return Result.success();
    }

    /**
     * 删除场景标签
     */
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteSceneTag(@PathVariable Long id) {
        sceneTagManageService.deleteSceneTag(id);
        return Result.success();
    }
}
