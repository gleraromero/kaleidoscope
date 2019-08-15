class DetailView
{
  constructor(title) {
    this.container = $("<div class='container' />");
    this.modal = create_modal(title, this.container, "detail_view");
  }

  show() {
    this.modal.show();
  }

  hide() {
    this.modal.hide();
  }

  add_section(title, content) {
    var section_header = $(`<div class="row section_header"><div class="col-md-12"><h4><a href="javascript:;">${title}</a></h4></div></div>`);
    var section_body = $('<div class="row section_body"><div class="col-md-12"></div></div>');
    $(section_body.find(".col-md-12")[0]).append(content);

    // Add click to hide section feature.
    $(section_header.find(".col-md-12")[0]).on('click', () => section_body.toggle());

    // Add section to the body of the modal.
    this.container.append(section_header);
    this.container.append(section_body);
    this.container.append("<hr />");
  }

  add_execution_section(stderr, exit_code) {
    if (stderr == "" && exit_code == "") return;
    var container = $("<div class='container'></div>");
    if (exit_code != undefined)
      container.append($(`<div class='row'><div class='col-md-12'><span class='detail_label'>Exit code: </span>${exit_code}</div></div></div>`));

    if (stderr != undefined) {
      container.append($(`<div class='row'><div class='col-md-12'><span class='detail_label'>Screen output: </span></div></div></div>`));
      container.append($(`<div class='row'><div class='col-md-12'><textarea class="screen_output">${stderr}</textarea></div></div></div>`));
    }
    this.add_section("Execution", container);
  }
}
