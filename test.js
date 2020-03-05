
generateSkippedRecordsReport("a972dd09db0300108471a7c748961951");

function generateSkippedRecordsReport(upgrade_patch) {
    var file_names = [];
    var gr = new GlideRecord('sys_upgrade_history_log');
    gr.addEncodedQuery('changed=true^type_priority=1^ORtype_priority=2^dispositionIN4,9,10');
    gr.addQuery('upgrade_history', upgrade_patch)
    gr.query();
    while (gr.next()) {
        var obj = {};
        obj.file = gr.file_name.toString(),
            obj.prio = gr.type_priority.toString();
        obj.link = gs.getProperty('glide.servlet.uri') + gr.getLink();
        obj.table = gr.sys_source_table.getDisplayValue();
        obj.disposition = gr.disposition.getDisplayValue();
        file_names.push(obj);
    }

    var csv = "Priority,Name,Disposition,Link to the upgrade history,Table name,Product name,Amount\n";
    for (i = 0; i < file_names.length; i++) {
        var gr = new GlideRecord("sys_update_xml");
        gr.addQuery('name', 'IN', file_names[i].file);
        gr.setLimit(1);
        gr.orderByDesc('sys_updated_on');
        gr.query();
        while (gr.next()) {
            csv += file_names[i].prio + "," + gr.name + "," + file_names[i].disposition +
                "," + file_names[i].link + "," + file_names[i].table + "," + gr.update_set.u_product.getDisplayValue() + "," + "1" + "," + "\n";
        }
    }

    var rec = new GlideRecord("sys_user");
    rec.addQuery("sys_id", gs.getUserID());
    rec.query();
    rec.next();
    GlideSysAttachment().write(rec, "skipped_records_report.csv", "text/csv", csv);
}
