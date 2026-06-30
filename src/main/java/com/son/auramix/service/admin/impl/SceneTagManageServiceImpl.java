package com.son.auramix.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.son.auramix.common.exception.BusinessException;
import com.son.auramix.common.result.ResultCode;
import com.son.auramix.domain.dto.admin.SceneTagCreateDTO;
import com.son.auramix.domain.dto.admin.SceneTagUpdateDTO;
import com.son.auramix.domain.entity.SceneTag;
import com.son.auramix.domain.vo.admin.SceneTagVO;
import com.son.auramix.mapper.SceneTagMapper;
import com.son.auramix.service.admin.SceneTagManageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 场景标签管理服务实现
 *
 * @author auramix
 */
@Service
@RequiredArgsConstructor
public class SceneTagManageServiceImpl implements SceneTagManageService {

    private final SceneTagMapper sceneTagMapper;

    @Override
    public List<SceneTagVO> getAllSceneTags() {
        LambdaQueryWrapper<SceneTag> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(SceneTag::getDisplayOrder, SceneTag::getId);
        return sceneTagMapper.selectList(wrapper).stream()
                .map(this::toVO)
                .collect(Collectors.toList());
    }

    @Override
    public void addSceneTag(SceneTagCreateDTO req) {
        // 检查名称是否重复
        Long count = sceneTagMapper.selectCount(
                new LambdaQueryWrapper<SceneTag>().eq(SceneTag::getName, req.getName())
        );
        if (count > 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "场景名称已存在");
        }

        SceneTag entity = new SceneTag();
        entity.setName(req.getName());
        entity.setDescription(req.getDescription());
        entity.setIcon(req.getIcon());
        entity.setSceneType(req.getSceneType());
        entity.setConditionsJson(req.getConditionsJson());
        entity.setTimezoneOffset(req.getTimezoneOffset() != null ? req.getTimezoneOffset() : 8);
        entity.setPriority(req.getPriority() != null ? req.getPriority() : 0);
        entity.setDisplayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0);
        entity.setStatus(req.getStatus() != null ? req.getStatus() : SceneTag.STATUS_ENABLED);

        sceneTagMapper.insert(entity);
    }

    @Override
    public void updateSceneTag(Long id, SceneTagUpdateDTO req) {
        SceneTag entity = sceneTagMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "场景标签不存在");
        }

        // 检查名称是否与其他记录冲突
        SceneTag existing = sceneTagMapper.selectOne(
                new LambdaQueryWrapper<SceneTag>().eq(SceneTag::getName, req.getName())
        );
        if (existing != null && !existing.getId().equals(id)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "场景名称已存在");
        }

        entity.setName(req.getName());
        entity.setDescription(req.getDescription());
        entity.setIcon(req.getIcon());
        entity.setSceneType(req.getSceneType());
        entity.setConditionsJson(req.getConditionsJson());
        entity.setTimezoneOffset(req.getTimezoneOffset());
        entity.setPriority(req.getPriority());
        entity.setDisplayOrder(req.getDisplayOrder());
        entity.setStatus(req.getStatus());

        sceneTagMapper.updateById(entity);
    }

    @Override
    public void deleteSceneTag(Long id) {
        SceneTag entity = sceneTagMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "场景标签不存在");
        }
        sceneTagMapper.deleteById(id);
    }

    /**
     * Entity 转 VO
     */
    private SceneTagVO toVO(SceneTag entity) {
        SceneTagVO vo = new SceneTagVO();
        vo.setId(entity.getId());
        vo.setName(entity.getName());
        vo.setDescription(entity.getDescription());
        vo.setIcon(entity.getIcon());
        vo.setSceneType(entity.getSceneType());
        vo.setConditionsJson(entity.getConditionsJson());
        vo.setTimezoneOffset(entity.getTimezoneOffset());
        vo.setPriority(entity.getPriority());
        vo.setDisplayOrder(entity.getDisplayOrder());
        vo.setStatus(entity.getStatus());
        vo.setCreatedAt(entity.getCreatedAt());
        vo.setUpdatedAt(entity.getUpdatedAt());
        return vo;
    }
}
