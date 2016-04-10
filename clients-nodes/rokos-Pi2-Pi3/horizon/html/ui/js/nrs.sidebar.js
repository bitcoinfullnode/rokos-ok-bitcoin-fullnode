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
	$(".sidebar_context").on("contextmenu", "a", function(e) {
		e.preventDefault();

		if (!NRS.databaseSupport) {
			return;
		}

		NRS.closeContextMenu();

		if ($(this).hasClass("no-context")) {
			return;
		}

		NRS.selectedContext = $(this);

		NRS.selectedContext.addClass("context");

		$(document).on("click.contextmenu", NRS.closeContextMenu);

		var contextMenu = $(this).data("context");

		if (!contextMenu) {
			contextMenu = $(this).closest(".list-group").attr("id") + "_context";
		}

		var $contextMenu = $("#" + contextMenu);

		if ($contextMenu.length) {
			var $options = $contextMenu.find("ul.dropdown-menu a");

			$.each($options, function() {
				var requiredClass = $(this).data("class");

				if (!requiredClass) {
					$(this).show();
				} else if (NRS.selectedContext.hasClass(requiredClass)) {
					$(this).show();
				} else {
					$(this).hide();
				}
			});

			$contextMenu.css({
				display: "block",
				left: e.pageX,
				top: e.pageY
			});
		}

		return false;
	});

	NRS.closeContextMenu = function(e) {
		if (e && e.which == 3) {
			return;
		}

		$(".context_menu").hide();

		if (NRS.selectedContext) {
			NRS.selectedContext.removeClass("context");
			//NRS.selectedContext = null;
		}

		$(document).off("click.contextmenu");
	}

	return NRS;
}(NRS || {}, jQuery));