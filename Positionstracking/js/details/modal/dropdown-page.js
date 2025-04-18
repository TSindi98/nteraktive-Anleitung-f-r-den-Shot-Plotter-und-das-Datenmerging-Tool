import {
    changePage,
    getDetails,
    setDetails,
    createId,
} from "../details-functions.js";
import { createDropdown } from "../widgets/widgets-base.js";
import { createReorderColumns } from "./main-page.js";

function createDropdownPage(id, data) {
    d3.select(id).selectAll("*").remove();

    let mb = d3
        .select(id)
        .append("div")
        .attr("id", "dropdown-page-mb")
        .attr("class", "modal-body");

    // explanation text
    mb.append("h6").text("Create Dropdown Widget");

    // example
    mb.append("div")
        .attr("id", "dropdown-page-example")
        .attr("class", "center example");
    createDropdown(
        "#dropdown-page-example",
        data
            ? { ...data, id: "sample-dropdown" }
            : {
                  id: "sample-dropdown",
                  title: "Detail Name",
                  options: [
                      { value: "Option 1 (Ctrl+1)", selected: true },
                      { value: "Option 2 (Ctrl+2)" },
                  ],
              }
    );

    mb.append("div").text(
        "Enter the detail name. Then, input a list of options for the dropdown, each option on a new line. The first option will be the default selection."
    );
    mb.append("hr");
    // text field
    let form = mb
        .append("form")
        .attr("class", "need-validation")
        .attr("novalidate", "true");
    let nameDiv = form
        .append("div")
        .attr("class", "form-group position-relative");
    nameDiv
        .append("label")
        .attr("for", "dropdown-title")
        .attr("class", "form-label")
        .text("Detail Name");
    nameDiv
        .append("input")
        .attr("type", "text")
        .attr("class", "form-control")
        .attr("id", "dropdown-title")
        .property("value", data ? data.title : "");
    nameDiv
        .append("div")
        .attr("class", "invalid-tooltip")
        .text(
            "Detail names must be 1-16 characters long, and can only contain alphanumeric characters, dashes, underscores, and spaces."
        );

    let optionsDiv = form
        .append("div")
        .attr("class", "form-group position-relative");
    optionsDiv
        .append("label")
        .attr("for", "dropdown-field-default-text")
        .attr("class", "form-label")
        .text("Options (and Shortcuts)");
    
    let optionsTextarea = optionsDiv
        .append("textarea")
        .attr("class", "form-control textarea")
        .attr("id", "dropdown-options")
        .attr("rows", "10");
    
    if (data && Array.isArray(data.options)) {
        const validLines = data.options
            .filter(x => x.value && x.value.trim() !== "") // nur sinnvolle Optionen
            .map(x => {
                const value = x.value.trim();
                const shortcut = x.shortcut !== undefined ? x.shortcut.trim() : '';
                return `${value} ; ${shortcut}`;
            });
    
        optionsTextarea.text(validLines.join("\n"));
    } else {
        optionsTextarea.text("Option 1 ; 1\nOption 2 ; 2\n");
    }
    
    // Tooltip für die Optionen
    optionsDiv
        .append("div")
        .attr("class", "invalid-tooltip")
        .text("Each option must be 1-50 characters long, and can include a shortcut in parentheses. If you don't want to use a shortcut, just leave the parentheses empty.");


    // footer
    let footer = d3.select(id).append("div").attr("class", "footer-row");
    footer
        .append("button")
        .attr("type", "button")
        .attr("class", "grey-btn")
        .text("Back")
        .on(
            "click",
            data
                ? () => changePage(id, "#main-page")
                : () => changePage(id, "#widget-type-page")
        );

    footer
        .append("button")
        .attr("type", "button")
        .attr("class", "grey-btn")
        .text("Create Dropdown")
        .on(
            "click",
            data ? () => createNewDropdown(data) : () => createNewDropdown()
        );

    $("#sample-dropdown-select").select2({
        dropdownParent: $("#sample-dropdown"),
        width: "100%",
        dropdownCssClass: "small-text",
    });
}

function createNewDropdown(data) {
    let invalid = false;

    const title = d3.select("#dropdown-title").property("value");
    if (
        title.length < 1 ||
        title.length > 16 ||
        !/^[_a-zA-Z0-9- ]*$/.test(title)
    ) {
        d3.select("#dropdown-title").classed("is-invalid", true);
        invalid = true;
    } else {
        d3.select("#dropdown-title").classed("is-invalid", false);
    }

    const text = d3.select("#dropdown-options").property("value");
    let optionValues = text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0 && line.includes(";")) // nur sinnvolle Zeilen!
    .map(line => {
        const parts = line.split(';');
        return {
            value: parts[0].trim(),
            shortcut: parts[1] ? parts[1].trim() : ''
        };
    });




    // drop empty value if it is last
    const last = optionValues.pop();
    if (last !== "") {
        optionValues.push(last);
    }

    if (optionValues.some((value) => value < 1 || value > 50)) {
        d3.select("#dropdown-options").classed("is-invalid", true);
        invalid = true;
    } else {
        d3.select("#dropdown-options").classed("is-invalid", false);
    }
    if (invalid) {
        return;
    }

    if (optionValues.length > 0) {
        optionValues[0] = { ...optionValues[0], selected: true };
    }

    let details = getDetails();
    const newDetail = {
        type: "dropdown",
        title: title,
        id: createId(title),
        options: optionValues,
        editable: true,
    };
    if (data) {
        let i = _.findIndex(details, data);
        details.splice(i, 1, newDetail);
    } else {
        details.push(newDetail);
    }
    setDetails(details);
    createReorderColumns("#reorder");

    changePage("#dropdown-page", "#main-page");
}

export { createDropdownPage };
