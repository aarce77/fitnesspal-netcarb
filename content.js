(function(id) {
    var tableId = id;
    var CARB_IDX = getFieldIndex('carbs') + 1;
    var FIBER_IDX = getFieldIndex('fiber') + 1;

    if(CARB_IDX === 0 || FIBER_IDX === 0) {
        return;
    }

    var NETCARB_GOAL;
    // get data from storage
    chrome.storage.sync.get({ netCarbs: null }, function(items) {
        var netCarbs = !items.netCarbs ? getCarbGoal() : parseInt(items.netCarbs);
        var $netCarbCol = $('#' + tableId + ' > tbody > tr.alt td.empty');
        $netCarbCol.removeClass('empty');
        $netCarbCol.text(netCarbs);

        processData(netCarbs);
    });

    function processData(fiberGoal) {
        var $fiberFooter = $('#' + tableId + ' > tfoot > tr > td.empty');

        $fiberFooter.removeClass('empty');
        $fiberFooter.addClass('alt nutrient-column').text('Net Carbs').append('<div class="subtitle">g</div>');
        $fiberFooter.css({'whiteSpace' : 'nowrap', 'padding' : '0 5px'});

        var carbs = parseInt($('#' + tableId + ' > tbody > tr.total:first > td:nth-child(' + CARB_IDX + ') > span.macro-value').text());
        console.log($('#' + tableId + ' > tbody > tr.total:first > td:nth-child(' + CARB_IDX + ') > span.macro-value').text());
        var fiber = parseInt($('#' + tableId + ' > tbody > tr.total:first > td:nth-child(' + FIBER_IDX + ')').text());
        console.log($('#' + tableId + ' > tbody > tr.total:first > td:nth-child(' + FIBER_IDX + ')').text());
        var netCarbs = (carbs-fiber);

        var $netCarbCol = $('#' + tableId + ' > tbody > tr.total:first > td.empty');
        $netCarbCol.removeClass('empty');
        $netCarbCol.text(netCarbs);

        var $remainingCol = $('#' + tableId + ' > tbody > tr.remaining td.empty');
        var ncGoals = fiberGoal-netCarbs;
        $remainingCol.text(ncGoals);
        $remainingCol.removeClass('empty');

        var css = (ncGoals < 0) ? 'negative' : 'positive';
        if(css === 'negative' && (fiberGoal + 20)-netCarbs >= 0) {
            css = '';
        }
            
        if(css) {
            $remainingCol.addClass((ncGoals < 0) ? 'negative' : 'positive');
        }

        renderGraph(netCarbs);
        setRecalculatedCarbGoal();
    }

    function getFieldIndex(name) {
        var index = -1;
        $('#' + tableId + ' tfoot tr td').each(function(idx,cell) {
            if($.trim(cell.innerText).toLowerCase().startsWith(name)) {
                index = idx;
            }
        });
        return index;
    }

    function getCarbGoal() {
        var goalCarbs = parseInt($('#' + tableId + ' > tbody > tr.total.alt:first > td:nth-child(' + CARB_IDX + ') > span.macro-value').text());
        return goalCarbs;
    }

    function setRecalculatedCarbGoal() {
        $totalCarbs = $('#' + tableId + ' > tbody > tr.total.alt:first > td:nth-child(' + CARB_IDX + ') > span.macro-value');
        $totalFiber = $('#' + tableId + ' > tbody > tr.total.alt:first > td:nth-child(' + FIBER_IDX + ')');

        var totalCarbs = parseInt($totalCarbs.text()) + parseInt($totalFiber.text());
        $totalCarbs.text(totalCarbs);

        var myTotalCarbs = parseInt($('#' + tableId + ' > tbody > tr.total:first > td:nth-child(' + CARB_IDX + ') > span.macro-value').text());
        var $remainingCarbs = $('#' + tableId + ' > tbody > tr.remaining:first > td:nth-child(' + CARB_IDX + ') > span.macro-value');
        var remainCarbs = (totalCarbs - myTotalCarbs);

        $remainingCarbs.text(remainCarbs);
        $remainingCarbs.parent().removeClass('negative');
        $remainingCarbs.parent().removeClass('positive');
        $remainingCarbs.parent().addClass((remainCarbs < 0) ? 'negative' : 'positive');
    }

    function renderGraph(netCarbs) {
        var temp = getBarGraphTemplate();
        $('#' + tableId + ' > tfoot').append(temp);

        var fatIdx = getFieldIndex('fat') + 1;
        var proteinIdx = getFieldIndex('protein') + 1;
        var caloriesIdx = getFieldIndex('calories') + 1;

        var calories = parseInt($('#' + tableId + ' > tbody > tr.total:first > td:nth-child(' + caloriesIdx + ')').text().replace(',',''));;
        var fats = parseInt($('#' + tableId + ' > tbody > tr.total:first > td:nth-child(' + fatIdx + ') > span.macro-value').text());
        var proteins = parseInt($('#' + tableId + ' > tbody > tr.total:first > td:nth-child(' + proteinIdx + ') > span.macro-value').text());

        var fullWidth = document.getElementById("ncx-bar-graph").offsetWidth;

        document.getElementById('ncx-end-label').innerText = calories;
        $('#ncx-end-label').css('left', (fullWidth - 30) + 'px');

        setBarGraph("ncx-bar-fats", fats, fats * 9, "Fats", calories);
        setBarGraph("ncx-bar-proteins", proteins, proteins * 4, "Proteins", calories);
        setBarGraph("ncx-bar-netcarbs", netCarbs, netCarbs * 4, "Net Carbs", calories);
    }

    function getBarGraphTemplate() {
        return '' +
        '<tr id="ncx-row">' +
        '   <td class="first ncx-bar-table-row"></td>' +
        '   <td class="first ncx-bar-table-row" colspan="7">' +
        '       <div class="ncx-bar-title">' +
        '           Macro &amp; Calories Consumption Percentages' +
        '       </div>' +
        '       <div id="ncx-bar-graph-container" class="ncx-bar-graph-container">' +
        '           <div id="ncx-bar-graph" class="ncx-bar-graph">' +
        '               <div style="margin-bottom:2px;">' +
        '                   <div id="ncx-bar-fats-label" class="ncx-bar-label"></div>' +
        '                   <div id="ncx-bar-fats" class="ncx-bar"></div>' +
        '               </div>' +
        '               <div style="margin-bottom:2px;">' +
        '                   <div id="ncx-bar-proteins-label" class="ncx-bar-label"></div>' +
        '                   <div id="ncx-bar-proteins" class="ncx-bar"></div>' +
        '               </div>' +
        '               <div>' +
        '                   <div id="ncx-bar-netcarbs-label" class="ncx-bar-label"></div>' +
        '                   <div id="ncx-bar-netcarbs" class="ncx-bar"></div>' +
        '               </div>' +
        '           </div>' +
        '           <div id="ncx-label-container" class="ncx-label-container">' +
        '               <span id="ncx-start-label" class="ncx-start-label">0</span>' +
        '               <span id="ncx-end-label" class="ncx-end-label"></span>' +
        '           </div>' +
        '       </div>' +
        '   </td>' +
        '</tr>';
    }

    function setBarGraph(id, macro, cals, label, calories) {
        var percentage = round((cals*100) / calories);
        if(isNaN(percentage)) {
            percentage = 0;
        }
        $("#" + id).css("width", percentage + "%");
        $("#" + id + "-label").text(label + ": " + macro + "g / " + cals + " cals - " + "(" +  percentage + "%)");
    }

    function round(val) {
        var factor = Math.pow(10, 1);
        return Math.round(val * factor) / factor;
    }

})('diary-table');