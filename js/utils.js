// Removes characters that can not belong to a DOM id.
function to_id(str) {
  return str.replace(/ /g, "_empty_").replace(/\./g, "_dot_").replace(/\#/g, "_hash_").replace(/-/g, "_dash_");
}

// Creates a modal dialog with the specified title and content.
// Adds it to the <body>.
// Returns: a reference to the jquery modal object.
function create_modal(title, content, className="") {
  modal = $(`<div class="modal ${className} fade" role="dialog"></div>`);
  modal_dialog = $(`<div class="modal-dialog modal-lg"></div>`);
  modal_content = $(`<div class="modal-content"></div>`);
  modal_header = $(`<div class="modal-header"><h4 class="modal-title">${title}</div></div>`);
  modal_body = $(`<div class="modal-body"></div>`);
  modal_footer = $(`<div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div>`);

  modal_header.appendTo(modal_content);
  modal_body.append(content);
  modal_body.appendTo(modal_content);
  modal_footer.appendTo(modal_content);
  modal_content.appendTo(modal_dialog);
  modal_dialog.appendTo(modal);
  $("body").append(modal);
  modal.show = () => { modal.modal("show"); };
  modal.hide = () => { modal.modal("hide"); };
  return modal;
}

// Indicates if the JSON object has the path specified.
// Example:
//  obj = {"hello": {"bye": 5}}.
//  has_path(obj, ["hello"]) == true
//  has_path(obj, ["hello", "bye"]) == true
//  has_path(obj, ["goodmorning", "bye"]) == false
function has_path(object, path) {
    if (object === undefined || object == null) return false;
    for (var i = 0; i < path.length; ++i) {
        if (object[path[i]] === undefined || object[path[i]] == null) return false;
        object = object[path[i]];
    }
    return true;
}

// Returns the value of the path in the object.
// Example:
//  obj = {"hello": {"bye": 5}}.
//  get_path(obj, []) == obj.
//  get_path(obj, ["hello"]) == {"bye": 5}
//  get_path(obj, ["hello", "bye"]) == 5
function get_path(object, path) {
  if (!has_path(object, path)) return undefined;
  var obj = object;
  for (node of path) obj = obj[node];
  return obj;
}

// Returns: if the object is a float.
function is_float(object)
{
  return object != undefined && object.toFixed != undefined && parseInt(object) != object;
}

// Returns the selected values of a chosen combobox.
function chosen_selected_values(chosen_select_id)
{
    var chosen_select = $(`#${chosen_select_id}`);
    var values_by_dataindex = [];

    // Support for option groups.
    $(`#${chosen_select_id} > optgroup`).each(function () {
        values_by_dataindex.push("");
        $(this).find("option").each(function () { values_by_dataindex.push($(this).val()); });
    });
    // Support for single options.
    $(`#${chosen_select_id} > option`).each(function() {values_by_dataindex.push($(this).val());});

    // Get ordered selected options.
    var ordered_selected_values = [];
    $(`#${chosen_select_id}_chosen .search-choice a`).each(function (element) {
        ordered_selected_values.push(values_by_dataindex[$(this).attr("data-option-array-index")]);
    });

    return ordered_selected_values;
}

// Copies the text to the clipboard.
function copy_to_clipboard(text)
{
    var temp_input = $('<textarea id="copy_input">' + text + '</textarea>');
    temp_input.appendTo(document.body);

    var temp_input_dom = document.getElementById("copy_input");
    temp_input_dom.select();
    document.execCommand("copy");
    document.body.removeChild(document.getElementById("copy_input"));
    alert("Copied to clipboard.");
}

// Function to append a file loader handler, that will call the callback with
// the file's content as a string for each file added. Parses JSON files and
// JSON files compressed in a tar.gz file.
// show_loading: function that is called when loading starts.
// hide_loading: function that is called when loading ends.
function add_file_loaded_callback(file_input_id, callback, show_loading, hide_loading)
{
    var file_handler = function(evt)
    {
        var files = evt.target.files; // FileList object

        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, f; f = files[i]; i++)
        {
            var reader = new FileReader();
            var extension = f.name.split('.').pop();

            show_loading();
            // Closure to capture the file information.
            reader.onload = function () {
                if (extension == "json")
                {
                    return function(e) {
                        hide_loading();
                        callback(e.target.result);
                    };
                }
                else if (extension == "gz")
                {
                    return function (e) {
                        var data = new Uint8Array(e.target.result);
                        var gunzip = new Zlib.Gunzip(data);
                        var decompressed_data = gunzip.decompress();
                        var decompressed_string = new TextDecoder("utf-8").decode(decompressed_data);
                        var opening_index = decompressed_string.indexOf("{");
                        var closing_index = decompressed_string.lastIndexOf("}");
                        decompressed_string = decompressed_string.substring(opening_index, closing_index+1);
                        hide_loading();
                        callback(decompressed_string);
                    };
                }
            }();

            // Read in the image file as a data URL.
            if (extension == "json") reader.readAsText(f);
            else if (extension == "gz") reader.readAsArrayBuffer(f);
        }
    }

    document.getElementById(file_input_id).addEventListener('change', file_handler, false);
}

cell_styles = ["font-weight-bold", "table-active", "table-success", "table-warning", "table-danger", "table-info"];
