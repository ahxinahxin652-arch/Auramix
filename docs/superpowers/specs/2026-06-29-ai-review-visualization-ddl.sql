-- AI 审核流程可视化 - DDL 变更
-- 执行前确认 track_review_records 表存在 agent_results 列
-- 日期: 2026-06-29

ALTER TABLE track_review_records
  ADD COLUMN progress_json TEXT NULL COMMENT 'AI审核过程进度轨迹JSON，完成后保留供回放'
  AFTER agent_results;
