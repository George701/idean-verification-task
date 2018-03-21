function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return JSON.stringify(obj) === JSON.stringify({});
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

function getLastKey(JSONlist) {
    var max_key = -1;
    Object.keys(JSONlist).map(function(key) {
        if(key > max_key){
            max_key = key;
        }
    });
    return ++max_key;
}

function switchItemState(l_id, i_id){
    if(!document.getElementById("ib_title_"+l_id+"_"+i_id).classList.contains("striked")){
        document.getElementById("ib_title_"+l_id+"_"+i_id).classList.add("striked");
        document.getElementById("ib_state_"+l_id+"_"+i_id).checked = true;
        dataList.lists[l_id].items[i_id].checked = true;
    }else{
        document.getElementById("ib_title_"+l_id+"_"+i_id).classList.remove("striked");
        document.getElementById("ib_state_"+l_id+"_"+i_id).checked = false;
        dataList.lists[l_id].items[i_id].checked = false;
    }
    updateProgress(l_id);
}

function updateProgress(l_id){
    var checked = listItemsCalculations(l_id, true), overall = listItemsCalculations(l_id);
    if(document.getElementById('ils_block_'+l_id) != null){
        document.getElementById("ils_progress_check_"+l_id).innerText = checked;
        document.getElementById("ils_progress_all_"+l_id).innerText = overall;

        if(checked == overall){
            if(!document.getElementById("ils_progress_holder_"+l_id).classList.contains("striked")){
                document.getElementById('ils_progress_holder_'+l_id).classList.add("striked");
            }
        }else{
            if(document.getElementById("ils_progress_holder_"+l_id).classList.contains("striked")){
                document.getElementById('ils_progress_holder_'+l_id).classList.remove("striked");
            }
        }
    }
    document.getElementById('std_checked_'+l_id).innerHTML = checked;
    document.getElementById('std_overall_'+l_id).innerHTML = overall;
    document.getElementById('elp_checked_'+l_id).innerHTML = checked;
    document.getElementById('elp_overall_'+l_id).innerHTML = overall;
}

function requestTemplate(method, path, sync){
    if(sync == null){
        sync = true;
    }

    var response;
    var ajax = new XMLHttpRequest();
    ajax.open(method, 'templates/'+path+'.html', sync);
    ajax.onreadystatechange = function(){
        if(this.readyState !== 4) return;
        if(this.status !== 200) return;
        response = ajax.responseText;
    };
    ajax.send();

    if(response != undefined){
        return response;
    }else{
        return false;
    }
}

//double clock function
function doubleclick(el, id, onsingle, ondouble) {
    if (el.getAttribute("data-dblclick") == null) {
        el.setAttribute("data-dblclick", 1);
        setTimeout(function () {
            if (el.getAttribute("data-dblclick") == 1) {
                onsingle(id);
            }
            el.removeAttribute("data-dblclick");
        }, 300);
    } else {
        el.removeAttribute("data-dblclick");
        ondouble(id);
    }
}

function displayListItems(id){
    if(document.querySelector("#ils_block_"+id) !== null){
        if(document.querySelector("#ils_block_"+id).classList.contains("hidden")){
            document.querySelector("#ils_block_"+id).classList.remove("hidden");
        }
    }else{
        document.getElementById("global_container").appendChild(createElementFromHTML(requestTemplate("GET", "modal_items", false).replace(/\%\%global_list_id\%\%/g, id)));

        document.getElementById("ils_title_"+id).innerHTML = dataList.lists[id].title;
        document.getElementById("ils_progress_check_"+id).innerText = listItemsAmountChecked(id);
        document.getElementById("ils_progress_all_"+id).innerText = listItemsAmount(id);
        if(listItemsAmountChecked(id) === listItemsAmount(id)) {
            if (!document.getElementById("ils_progress_holder_" + id).classList.contains("striked")) {
                document.getElementById("ils_progress_holder_" + id).classList.add("striked");
            }
        }

        if(!isEmpty(dataList.lists[id].items)){
            var template = requestTemplate("GET", "item", false);

            Object.keys(dataList.lists[id].items).map(function(i_id) {
                renderItem(template, id, i_id);
            });
            updateProgress(id);
        }


        // List header controls events
        document.getElementById("ils_back_"+id).addEventListener("click", function(){
            document.getElementById("ils_block_"+id).classList.add("hidden");
        });
        document.getElementById("ils_edit_"+id).addEventListener("click", function(){
            displayModalEdit(id);
        });

        document.getElementById("i_btn_add_"+id).addEventListener("click", function(){
            document.getElementById("ils_block_"+id).appendChild(createElementFromHTML(requestTemplate('GET', "modal_item_add", false)));
            rebindModalLayer();

            document.getElementById('btn_cncl_nl').addEventListener("click", function(e){
                e.stopPropagation();
                document.getElementById('modal_layer').remove();
            });

            document.getElementById("cr_save").addEventListener("click", function(e){
                var title = document.getElementById('cr_name').value;
                var comment = document.getElementById('cr_dscrp').value;
                if(title !== ""){
                    var new_item = {
                        "title":title,
                        "comment":comment,
                        "checked": false
                    };
                    var new_id = getLastKey(dataList.lists[id].items);
                    dataList.lists[id].items[new_id] = new_item;
                    document.getElementById('modal_layer').remove();

                    renderItem(requestTemplate("GET", "item", false), id, new_id);
                    updateProgress(id);
                }else{
                    // change visual style of unfilled boxes
                }
            });
        });
    }
}

function displayModalEdit(id){
    document.getElementById("global_container").appendChild(createElementFromHTML(requestTemplate("GET", "modal_edit", false).replace(/\%\%global_id\%\%/g, id)));

    document.getElementById('el_name_'+id).value = dataList.lists[id].title;
    document.getElementById('el_dscrp_'+id).value = dataList.lists[id].commentary;

    rebindModalLayer();

    //Edit controls events
    document.getElementById('btn_cncl_nl').addEventListener("click", function(e){
        e.stopPropagation();
        document.getElementById('modal_layer').remove();
    });

    document.getElementById('dlt_'+id).addEventListener("click", function(e){
        e.stopPropagation();
        delete dataList.lists[id];
        console.log(dataList.lists);
        document.getElementById('modal_layer').remove();
        document.getElementById('emp_'+id).remove();
        if(document.getElementById('ils_block_'+id) != null){
            document.getElementById('ils_block_'+id).remove();
        }
    });

    document.getElementById('el_save_'+id).addEventListener("click", function(e){
        e.stopPropagation();
        var isChanged = false;

        if(dataList.lists[id].title !==  document.getElementById('el_name_'+id).value){
            dataList.lists[id].title = document.getElementById('el_name_'+id).value;
            isChanged = true;
        }
        if(dataList.lists[id].comment !==  document.getElementById('el_dscrp_'+id).value){
            dataList.lists[id].comment =  document.getElementById('el_dscrp_'+id).value;
            isChanged = true;
        }

        if(isChanged){
            if(document.getElementById('ils_block_'+id) != null){
                document.getElementById('ils_title_'+id).innerText = dataList.lists[id].title;
            }
            document.getElementById('std_ttl_'+id).innerText = dataList.lists[id].title;
            document.getElementById('elp_ttl_'+id).innerText = dataList.lists[id].title;
            document.getElementById('elp_comment_'+id).innerText = dataList.lists[id].comment;

            // document.getElementById('emp_'+id).remove();
        }
        document.getElementById('modal_layer').remove();
    });


    // TODO: Add cancellation on background click
    // document.getElementById("modal_addl").addEventListener("click", function (e){
    //     e.stopPropagation();
    //     document.getElementById('modal_addl').remove();
    // });
}

function renderItem(template, id, i_id){
    var current_item = template.replace(/\%\%global_item_id\%\%/g, i_id).replace(/\%\%global_list_id\%\%/g, id);
    document.getElementById("ils_container_"+id).appendChild(createElementFromHTML(current_item));

    document.getElementById("ib_title_"+id+"_"+i_id).innerHTML = dataList.lists[id].items[i_id].title;
    if(dataList.lists[id].items[i_id].checked){
        document.getElementById("ib_state_"+id+"_"+i_id).checked = true;
        if(!document.getElementById("ib_title_"+id+"_"+i_id).classList.contains("striked")){
            document.getElementById("ib_title_"+id+"_"+i_id).classList.add("striked");
        }
    }

    // Events
    document.getElementById("ib_edit_"+id+"_"+i_id).onclick = function (){
        //check if opened
        document.getElementById("i_block_holder_"+id+"_"+i_id).appendChild(createElementFromHTML(requestTemplate("GET", "edit_popup", false).replace(/\%\%global_i_id\%\%/g, i_id).replace(/\%\%global_l_id\%\%/g, id)));

        rebindModalLayer();
        /*
            it_ed_blc_%%global_l_id%%_%%global_i_id%%
        * it_ed_opt_%%global_l_id%%_%%global_i_id%%
        * it_as_opt_%%global_l_id%%_%%global_i_id%%
        * it_re_opt_%%global_l_id%%_%%global_i_id%%
        *
        * */
    };

    document.getElementById("ib_state_"+id+"_"+i_id).addEventListener("click", function(){
        switchItemState(id, i_id);
    });
    document.getElementById("ib_title_"+id+"_"+i_id).addEventListener("click", function(){
        switchItemState(id, i_id);
    });
}

function renderList(template, id){
    document.getElementById("global_container").appendChild(createElementFromHTML(template.replace(/\%\%global_id\%\%/g, id)));

    // Data
    document.getElementById('std_ttl_'+id).innerHTML = dataList.lists[id].title;
    document.getElementById('elp_ttl_'+id).innerHTML = dataList.lists[id].title;
    document.getElementById('elp_comment_'+id).innerHTML = dataList.lists[id].commentary;
    document.getElementById('elp_au_'+id).innerHTML = dataList.lists[id].author;
    document.getElementById('elp_date_'+id).innerHTML = dataList.lists[id].date;

    document.getElementById('std_checked_'+id).innerHTML = listItemsCalculations(id, true);
    document.getElementById('std_overall_'+id).innerHTML = listItemsCalculations(id);
    document.getElementById('elp_checked_'+id).innerHTML = listItemsCalculations(id, true);
    document.getElementById('elp_overall_'+id).innerHTML = listItemsCalculations(id);

    // List of lists controls events
    document.getElementById("std_"+id).addEventListener("click", function(){
        doubleclick(document.getElementById("std_"+id), id, displayListItems, flip_this);
    });
    document.getElementById('elp_'+id).addEventListener("click", function(){
        doubleclick(document.getElementById('elp_'+id), id, displayListItems, flip_this);
    });
    document.getElementById('btn_edit_'+id).addEventListener("click", function(e){
        e.stopPropagation();
        displayModalEdit(id);
    });
}

function listItemsAmount(list_id){
    return listItemsCalculations(list_id);
}

function listItemsAmountChecked(list_id){
    return listItemsCalculations(list_id, true);
}

function listItemsCalculations(id, checked){
    var items_all = 0, items_checked = 0;
    Object.keys(dataList['lists'][''+id]['items']).map(function(i_id){
        if(dataList['lists'][''+id]['items'][i_id]['checked']){
            items_checked++;
        }
        items_all++;
    });
    if(checked != null){
        if(checked){
            return items_checked;
        }else{
            return items_all - items_checked;
        }
    }else{
        return items_all;
    }
}

function flip_this(id){
    if(document.getElementById('std_'+id).classList.contains("hidden")){
        document.getElementById('std_'+id).classList.remove("hidden");
        if(!document.getElementById('elp_'+id).classList.add("hidden")){
            document.getElementById('elp_'+id).classList.add("hidden");
        }
    }else if(document.getElementById('elp_'+id).classList.contains("hidden")){
        document.getElementById('elp_'+id).classList.remove("hidden");
        if(!document.getElementById('std_'+id).classList.contains("hidden")){
            document.getElementById('std_'+id).classList.add("hidden");
        }
    }

    //todo: flip back all flipped lists except current one
}

function rebindModalLayer(){
    document.getElementById("modal_layer").addEventListener("click", function(e){
        e.stopPropagation();
        if(e.target.id == "modal_layer"){
            document.getElementById("modal_layer").remove();
        }
    });
}

window.onload = function(){
    var template = requestTemplate("GET", "inner_list_template", false);
    // For every list generate block
    Object.keys(dataList['lists']).map(function(id){
        renderList(template, id);
    });

    /*------------------------------------------*/
    /*               Modal-window               */
    /*------------------------------------------*/
    document.getElementById('btn_add').addEventListener("click", function(){
        document.getElementById("global_container").appendChild(createElementFromHTML(requestTemplate("GET", "modal_create", false)));

        rebindModalLayer();

        document.getElementById('btn_cncl_nl').addEventListener("click", function(e){
            e.stopPropagation();
            document.getElementById('modal_layer').remove();
        });
        document.getElementById('cr_save').addEventListener("click", function(e){
            e.stopPropagation();

            var title = document.getElementById('cr_name').value;
            var comment = document.getElementById('cr_dscrp').value;
            if(title !== ""){
                var new_list = {
                    "title":title,
                    "commentary":comment,
                    "author":"NONE",
                    "date":"NONE",
                    "items":{}
                };
                var new_id = getLastKey(dataList.lists);
                dataList.lists[new_id] = new_list;
                document.getElementById('modal_layer').remove();

                renderList(requestTemplate("GET", "inner_list_template", false), new_id);
            }else{
                // change visual style of unfilled boxes
            }

        });
        // TODO: Add cancellation on background click
        // document.getElementById("modal_addl").addEventListener("click", function (e){
        //     e.stopPropagation();
        //     document.getElementById('modal_addl').remove();
        // });
    });
};