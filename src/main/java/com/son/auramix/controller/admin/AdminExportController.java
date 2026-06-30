package com.son.auramix.controller.admin;

import com.son.auramix.service.analytics.AnalyticsService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

/**
 * 报表导出入口: 流式 CSV 输出.
 */
@RestController
@RequestMapping("/api/admin/manage/analytics/export")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT_ADMIN') or hasAuthority('ADMIN')")
public class AdminExportController {

    private final AnalyticsService analyticsService;

    @GetMapping
    public void export(
            @RequestParam String module,
            @RequestParam(required = false, defaultValue = "7d") String range,
            HttpServletResponse response) throws IOException {

        String filename = "analytics-" + module + "-" + LocalDate.now() + ".csv";
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8);

        response.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8").toString());
        response.setCharacterEncoding("UTF-8");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + encoded);

        try (PrintWriter writer = response.getWriter()) {
            // 写 BOM, 让 Excel 直接识别 UTF-8
            writer.write('\ufeff');
            List<String[]> rows = analyticsService.export(module, range);
            if (rows != null) {
                for (String[] row : rows) {
                    writer.println(toCsvRow(row));
                }
            }
            writer.flush();
        }
    }

    private String toCsvRow(String[] cells) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < cells.length; i++) {
            if (i > 0) sb.append(',');
            String cell = cells[i] == null ? "" : cells[i];
            // 含逗号/引号/换行的字段加引号, 引号转义
            if (cell.contains(",") || cell.contains("\"") || cell.contains("\n") || cell.contains("\r")) {
                sb.append('"').append(cell.replace("\"", "\"\"")).append('"');
            } else {
                sb.append(cell);
            }
        }
        return sb.toString();
    }
}