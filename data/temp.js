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

function requestTemplate(method, path, sync){
    if(sync == null){
        sync = true;
    }

    var ajax = new XMLHttpRequest();
    ajax.open(method, 'templates/'+path+'.html', sync);
    ajax.onreadystatechange = function(){
        if(this.readyState !== 4) return;
        if(this.status !== 200) return;
        return ajax.responseText;
    }
    ajax.send();
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
        var ajax = new XMLHttpRequest();
        ajax.open('GET', 'templates/modal_items.html', false);
        ajax.onreadystatechange = function(){
            if(this.readyState !== 4) return;
            if(this.status !== 200) return;
            var block_template = ajax.responseText;

            block_template = block_template.replace(/\%\%global_list_id\%\%/g, id);
            document.getElementById("global_container").appendChild(createElementFromHTML(block_template));
            document.getElementById("ils_title_"+id).innerHTML = dataList.lists[id].title;
            document.getElementById("ils_progress_check_"+id).innerText = listItemsAmountChecked(id);
            document.getElementById("ils_progress_all_"+id).innerText = listItemsAmount(id);

            if(listItemsAmountChecked(id) === listItemsAmount(id)){
                if(!document.getElementById("ils_progress_holder_"+id).classList.contains("striked")){
                    document.getElementById("ils_progress_holder_"+id).classList.add("striked");
                }
            }

            // if(!isEmpty(dataList.lists[id].items)){
            var item_tpl
            var i_ajax = new XMLHttpRequest();
            i_ajax.open('GET', 'templates/item.html', false);
            i_ajax.onreadystatechange = function(){
                if(this.readyState !== 4) return;
                if(this.status !== 200) return;
                item_tpl = i_ajax.responseText;

            };
            i_ajax.send();

            Object.keys(dataList.lists[id].items).map(function(i_id) {
                var current_item = item_tpl.replace(/\%\%global_item_id\%\%/g, i_id).replace(/\%\%global_list_id\%\%/g, id);
                document.getElementById("ils_container_"+id).appendChild(createElementFromHTML(current_item));

                document.getElementById("ib_title_"+id+"_"+i_id).innerHTML = dataList.lists[id].items[i_id].title;

                document.getElementById("ib_edit_"+id+"_"+i_id).onclick = function (id, i_id){
                    alert("Hello");
                };

                console.log(dataList.lists[id].items[i_id].checked);
                if(dataList.lists[id].items[i_id].checked){
                    document.getElementById("ib_state_"+id+"_"+i_id).checked = true;
                    if(!document.getElementById("ib_title_"+id+"_"+i_id).classList.contains("striked")){
                        document.getElementById("ib_title_"+id+"_"+i_id).classList.add("striked");
                    }
                }
            });

            // }


            document.getElementById("ils_back_"+id).addEventListener("click", function(e){
                document.getElementById("ils_block_"+id).classList.add("hidden");
            });

            document.getElementById("ils_edit_"+id).addEventListener("click", function(e){
                displayModalEdit(id);
            });
        };
        ajax.send();
    }
}

function displayModalEdit(id){
    var ajax1 = new XMLHttpRequest();
    ajax1.open('GET', 'templates/modal_edit.html', false);
    ajax1.onreadystatechange = function() {
        if(this.readyState !== 4) return;
        if(this.status !== 200) return;

        var block_template = ajax1.responseText;
        var temp_template = block_template.replace(/\%\%global_id\%\%/g, id);
        document.querySelector("#global_container").appendChild(createElementFromHTML(temp_template));

        document.getElementById('el_name_'+id).value = dataList.lists[id].title;
        document.getElementById('el_dscrp_'+id).value = dataList.lists[id].commentary;

        document.getElementById('btn_cncl_nl').addEventListener("click", function(e){
            e.stopPropagation();
            e.preventDefault();
            // document.getElementById('btn_cncl_nl').onclick = function(){};
            document.getElementById('modal_addl').remove();
        });
        // TODO: Add cancellation on background click
        // document.getElementById("modal_addl").addEventListener("click", function (e){
        //     e.stopPropagation();
        //     e.preventDefault();
        //     // document.getElementById("modal_addl").onclick = function(){};
        //     document.getElementById('modal_addl').remove();
        // });
    };
    ajax1.send();
}

function listItemsAmount(list_id){
    return listItemsCalculations(list_id);
}

function listItemsAmountChecked(list_id){
    return listItemsCalculations(list_id, true);
}

function listItemsCalculations(id, checked){
    var items_all = 0, items_checked = 0;
    Object.keys(dataList['lists'][''+id]['items']).map(function(i_id, val, arr){
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







var double = function(id){
    document.getElementById('std_'+id).style.display = "none";
    document.getElementById('elp_'+id).style.display = "block";
};
var double_flip = function(id){
    document.getElementById('elp_'+id).style.display = "none";
    document.getElementById('std_'+id).style.display = "block";
};
var single = function(id){
    console.log("Single tap on standard box");
    displayListItems(id);
};
var single_flip = function(id){
    console.log("Single tap on flipped box");
    displayListItems(id);
};



var ajax = new XMLHttpRequest();
ajax.open('GET', 'templates/inner_list_template.html', false);
ajax.onreadystatechange = function() {
    if(this.readyState !== 4) return;
    if(this.status !== 200) return;
    var block_template = ajax.responseText;

    // For every list generate block
    Object.keys(dataList['lists']).map(function(id){
        var tmp_block_template = block_template.replace(/\%\%global_id\%\%/g, id);
        document.querySelector("#global_container").appendChild(createElementFromHTML(tmp_block_template));


        // Data
        document.getElementById('std_ttl_'+id).innerHTML = dataList.lists[id].title;
        document.getElementById('elp_ttl_'+id).innerHTML = dataList.lists[id].title;
        document.getElementById('elp_comment_'+id).innerHTML = dataList.lists[id].commentary;
        document.getElementById('elp_au_'+id).innerHTML = dataList.lists[id].author;
        document.getElementById('elp_date_'+id).innerHTML = dataList.lists[id].date;
        // Progress calculation
        var ovrll_progress = 0, checked = 0;
        Object.keys(dataList['lists'][''+id]['items']).map(function(i_id, val, arr){
            if(dataList['lists'][''+id]['items'][i_id]['checked']){
                checked++;
            }
            ovrll_progress++;
        });
        document.getElementById('std_progress_'+id).innerHTML = checked + "/" + ovrll_progress;
        document.getElementById('elp_progress_'+id).innerHTML = "(" + checked + "/" + ovrll_progress + ")";


        // Events
        document.getElementById("std_"+id).addEventListener("click", function(){
            doubleclick(document.getElementById("std_"+id), id, single, double);
        });
        document.getElementById('elp_'+id).addEventListener("click", function(){
            doubleclick(document.getElementById('elp_'+id), id, single_flip, double_flip);
        });
        document.getElementById('btn_edit_'+id).addEventListener("click", function(e){
            e.stopPropagation();
            displayModalEdit(id);
        });

    });
};
ajax.send();




/*------------------------------------------*/
/*               Modal-window               */
/*------------------------------------------*/
document.getElementById('btn_add').addEventListener("click", function(){
    var ajax = new XMLHttpRequest();
    ajax.open('GET', 'templates/modal_create.html', false);
    ajax.onreadystatechange = function() {

        if(this.readyState !== 4) return;
        if(this.status !== 200) return;

        var block_template = ajax.responseText;
        document.querySelector("#global_container").appendChild(createElementFromHTML(block_template));

        document.getElementById('btn_cncl_nl').addEventListener("click", function(e){
            e.stopPropagation();
            e.preventDefault();
            // document.getElementById('btn_cncl_nl').onclick = function(){};
            document.getElementById('modal_addl').remove();
        });
        // TODO: Add cancellation on background click
        // document.getElementById("modal_addl").addEventListener("click", function (e){
        //     e.stopPropagation();
        //     e.preventDefault();
        //     // document.getElementById("modal_addl").onclick = function(){};
        //     document.getElementById('modal_addl').remove();
        // });
    };
    ajax.send();
});
