/**
 * 数据类型统一导出
 *
 *  - DO  (Data Object)      : 业务领域对象 (MusicLibrary, Track, TaskRecord)
 *  - DTO (Data Transfer Object) : 请求参数对象
 *  - VO  (View Object)      : 响应视图对象
 */

// DO
const MusicLibrary = require('./do/MusicLibrary')
const Album = require('./do/Album')
const Track = require('./do/Track')
const TaskRecord = require('./do/TaskRecord')

// VO
const ApiResult = require('./vo/ApiResult')
const {
  WarehouseListVO, WarehouseItemVO, WarehouseCreateVO,
  WarehouseTracksVO, ImportResultVO, ScanResultVO, ScanFileItem,
  ConvertProgressEvent, SupportedFormatsVO, DecryptFileResultVO,
} = require('./vo/ResponseVOs')

// DTO
const {
  CreateWarehouseDTO, ImportFilesDTO, ScanFilesDTO,
  StartConvertDTO, DecryptFileDTO, StartDecryptDTO,
} = require('./dto/RequestDTOs')

module.exports = {
  // DO
  MusicLibrary,
  Album,
  Track,
  TaskRecord,
  // VO
  ApiResult,
  WarehouseListVO,
  WarehouseItemVO,
  WarehouseCreateVO,
  WarehouseTracksVO,
  ImportResultVO,
  ScanResultVO,
  ScanFileItem,
  ConvertProgressEvent,
  SupportedFormatsVO,
  DecryptFileResultVO,
  // DTO
  CreateWarehouseDTO,
  ImportFilesDTO,
  ScanFilesDTO,
  StartConvertDTO,
  DecryptFileDTO,
  StartDecryptDTO,
}
