package com.son.auramix.service.admin;

import com.son.auramix.domain.dto.admin.SceneTagCreateDTO;
import com.son.auramix.domain.dto.admin.SceneTagUpdateDTO;
import com.son.auramix.domain.vo.admin.SceneTagVO;

import java.util.List;

/**
 * 场景标签管理服务接口
 *
 * @author auramix
 */
public interface SceneTagManageService {

    /**
     * 获取所有场景标签
     */
    List<SceneTagVO> getAllSceneTags();

    /**
     * 新增场景标签
     */
    void addSceneTag(SceneTagCreateDTO req);

    /**
     * 更新场景标签
     */
    void updateSceneTag(Long id, SceneTagUpdateDTO req);

    /**
     * 删除场景标签
     */
    void deleteSceneTag(Long id);
}
