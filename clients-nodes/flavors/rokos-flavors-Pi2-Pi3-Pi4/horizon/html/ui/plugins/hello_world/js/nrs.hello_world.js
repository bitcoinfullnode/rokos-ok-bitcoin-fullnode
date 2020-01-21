/******************************************************************************
 * Copyright © 2013-2015 The Nxt Core Developers.                             *
 *                                                                            *
 * See the AUTHORS.txt, DEVELOPER-AGREEMENT.txt and LICENSE.txt files at      *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Nxt software, including this file, may be copied, modified, propagated,    *
 * or distributed except according to the terms contained in the LICENSE.txt  *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

/**
 * @depends {nrs.js}
 */
var NRS = (function(NRS, $, undefined) {

	NRS.pages.p_hello_world = function() {
		var rows = "";
		
		NRS.sendRequest("getBlockchainStatus", {}, function(response) {
			if (response.lastBlock != undefined) {
				$.each(response, function(fieldName, value) {
					rows += "<tr>";
					rows += "<td>" + String(fieldName).escapeHTML() + "</td>";
					if (fieldName == "lastBlockchainFeederHeight" && value) {
						//Making use of existing client modals and functionality
						var valueHTML = "<a href='#' data-block='" + String(value).escapeHTML() + "' class='show_block_modal_action'>";
						valueHTML += String(value).escapeHTML() + "</a>";
					} else {
						var valueHTML = String(value).escapeHTML();
					}

					rows += "<td>" + valueHTML + "</td>";
					rows += "</tr>"; 
				});
			}
			NRS.dataLoaded(rows);
		});
	}

	NRS.setup.p_hello_world = function() {
		//Do one-time initialization stuff here
		$('#p_hello_world_startup_date_time').html(moment().format('LLL'));

	}

	return NRS;
}(NRS || {}, jQuery));

//File name for debugging (Chrome/Firefox)
//@ sourceURL=nrs.hello_world.js