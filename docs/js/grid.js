class Grid
{
    constructor(container) {
        this.container = container;
        this.column_groups = new Map();
        this.rows = [];
        this.buttons = [];
    }

    addColumn(column) {
        this.column_groups.get(column.column_group_id).columns.push(column);
    }

    addRow(groups_data) {
        this.rows.push(groups_data);
    }

    addColumnGroup(column_group) {
        if (column_group.columns == undefined) column_group.columns = [];
        this.column_groups.set(column_group.id, column_group);
    }

    addButton(text, action) {
        this.buttons.push({ text: text, action: action });
    }

    addCSVButton() {
        this.addButton("CSV", () => { copy_to_clipboard(this.toCSV()); });
    }

    toCSV() {
        var thead_rows = $(this.container.table).find("thead tr");
        var tbody_rows = $(this.container.table).find("tbody tr");

        var content = "";
        // Header rows.
        thead_rows.each(function() {
            var tr = $(this);
            var first = true;
            tr.find("th").each(function () {
                var th = $(this);
                var caption = th.text();
                if (th.hasClass("ignore_csv")) return;
                if (!first) content += "\t";
                first = false;
                content += caption;
                if (parseInt(th.attr("colspan")) > 1)
                    for (var i = 2; i < parseInt(th.attr("colspan")); ++i) content += "\t";
            });
            content += "\n";
        });

        // Content rows.
        tbody_rows.each(function() {
            var tr = $(this);
            var first = true;
            tr.find("td").each(function () {
                var td = $(this);
                var caption = td.text();
                if (td.hasClass("ignore_csv")) return;

                if (!first) content += "\t";
                first = false;
                content += caption;
            });
            content += "\n";
        });

        return content;
    }

    render() {
        var table = $('<table style="height:70%; width:100%" cellpadding="5" cellspacing="0" border="0" class="table_view display table-hover table-striped"></table>');

        // Render table header.
        var header = $("<thead></thead>");
        var header_groups = $("<tr class='header_row1'></tr>");
        var header_columns = $("<tr class='header_row2'></tr>");
        for (var [dummy, column_group] of this.column_groups) {
            $(`<th class='experiment_header' colspan="${column_group.columns.length}">${column_group.text}</th>`).appendTo(header_groups);
            var is_first = true;
            column_group.columns.forEach(column => {
                $(`<th class='${(is_first ? "experiment_first " : " ")} ${column.className ? column.className : ""}'>${column.text}</th>`).appendTo(header_columns);
                is_first = false;
            });
        }
        header_groups.appendTo(header);
        header_columns.appendTo(header);
        header.appendTo(table);

        // Generate datatable columns.
        var datatable_cols = [];
        for (var [dummy, column_group] of this.column_groups) {
            var is_first = true;
            column_group.columns.forEach(column => {
                datatable_cols.push({data:column_group.id+"~"+column.id, orderable:false, className:(is_first ? "experiment_first " : " ") + column.className ? column.className : ""});
                is_first = false;
            });
        }

        // Generate datatable rows.
        var datatable_rows = [];
        for (var i = 0; i < this.rows.length; ++i) {
            var row = this.rows[i];
            var datatable_row = {};
            for (var [dummy, column_group] of this.column_groups) {
                column_group.columns.forEach(column => {
                    datatable_row[column_group.id+"~"+column.id] = row[column_group.id][column.id];
                });
            }
            datatable_rows.push(datatable_row);
        }

        // Render table on container.
        this.container.empty();
        table.appendTo(this.container);
        table.DataTable({
            scrollY:        '60vh',
            scrollX:        true,
            scrollCollapse: true,
            ordering: false,
            paging:         false,
            data: datatable_rows,
            columns: datatable_cols,
            fixedColumns:   { leftColumns: 1, rightColumns: 0 },
            dom: 'Bfrtip',
            buttons: this.buttons
        });
        this.container.table = table;
    }
}
