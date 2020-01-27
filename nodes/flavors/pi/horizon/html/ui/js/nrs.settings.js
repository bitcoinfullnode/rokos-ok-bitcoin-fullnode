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
var NRS = (function(NRS, $) {
	NRS.defaultSettings = {
		"submit_on_enter": "0",
		"animate_forging": "1",
		"news": "-1",
		"marketplace": "-1",
		"console_log": "0",
		"fee_warning": "100000000000",
		"amount_warning": "10000000000000",
		"asset_transfer_warning": "10000",
		"currency_transfer_warning": "10000",
		"24_hour_format": "1",
		"remember_passphrase": "0",
		"language": "en",
		"enable_plugins": "0",
		"items_page": "15",
		"themeChoice": "default",
        "admin_password": ""
	};

	NRS.defaultColors = {
		"header": "#084F6C",
		"sidebar": "#F4F4F4",
		"boxes": "#3E96BB"
	};

	NRS.languages = {
		"de": "Deutsch",                 // german
		"en": "English",                 // english
		"es-es": "Español",              // spanish
		"ca": "Català",                  // catalan
		"fi": "Suomi (Experimental)",    // finnish
		"fr": "Français",                // french
		"gl": "Galego (Experimental)",   // galician
		"el": "Ελληνικά (Experimental)", // greek
		"sh": "Hrvatski (Experimental)", // croatian
		"hi": "हिन्दी (Experimental)",  // hindi
		"id": "Bahasa Indonesia",        // indonesian
		"it": "Italiano",                // italian
		"ja": "日本語",                   // japanese
		"lt": "Lietuviškai",             // lithuanian
		"nl": "Nederlands",              // dutch
		"cs": "Čeština (Beta)",          // czech
		"sk": "Slovensky (Beta)",        // slovakian
		"pt-pt": "Português",            // portugese
		"pt-br": "Português Brasileiro", // portugese, brazilian
		"sr": "Српски (Experimental)",   // serbian, cyrillic
		"sr-cs": "Srpski (Experimental)",// serbian, latin
		"bg": "Български",               // bulgarian
		"ro": "Român",                   // romanian
		"tr": "Türk (Experimental)",     // turkish
		"uk": "Yкраiнска",               // ukrainian
		"ru": "Русский",                 // russian
		"zh-cn": "中文 simplified",      // chinese simplified
		"zh-tw": "中文 traditional"      // chinese traditional
	};

	var userStyles = {};

	userStyles.header = {
		"blue": {
			"header_bg": "#3c8dbc",
			"logo_bg": "#367fa9",
			"link_bg_hover": "#357ca5"
		},
		"green": {
			"header_bg": "#29BB9C",
			"logo_bg": "#26AE91",
			"link_bg_hover": "#1F8E77"
		},
		"red": {
			"header_bg": "#cb4040",
			"logo_bg": "#9e2b2b",
			"link_bg_hover": "#9e2b2b",
			"toggle_icon": "#d97474"
		},
		"brown": {
			"header_bg": "#ba5d32",
			"logo_bg": "#864324",
			"link_bg_hover": "#864324",
			"toggle_icon": "#d3815b"
		},
		"purple": {
			"header_bg": "#86618f",
			"logo_bg": "#614667",
			"link_bg_hover": "#614667",
			"toggle_icon": "#a586ad"
		},
		"gray": {
			"header_bg": "#575757",
			"logo_bg": "#363636",
			"link_bg_hover": "#363636",
			"toggle_icon": "#787878"
		},
		"pink": {
			"header_bg": "#b94b6f",
			"logo_bg": "#8b3652",
			"link_bg_hover": "#8b3652",
			"toggle_icon": "#cc7b95"
		},
		"bright-blue": {
			"header_bg": "#2494F2",
			"logo_bg": "#2380cf",
			"link_bg_hover": "#36a3ff",
			"toggle_icon": "#AEBECD"
		},
		"dark-blue": {
			"header_bg": "#25313e",
			"logo_bg": "#1b252e",
			"link_txt": "#AEBECD",
			"link_bg_hover": "#1b252e",
			"link_txt_hover": "#fff",
			"toggle_icon": "#AEBECD"
		}
	};

	userStyles.sidebar = {
		"dark-gray": {
			"sidebar_bg": "#272930",
			"user_panel_txt": "#fff",
			"sidebar_top_border": "#1a1c20",
			"sidebar_bottom_border": "#2f323a",
			"menu_item_top_border": "#32353e",
			"menu_item_bottom_border": "#1a1c20",
			"menu_item_txt": "#c9d4f6",
			"menu_item_bg_hover": "#2a2c34",
			"menu_item_border_active": "#2494F2",
			"submenu_item_bg": "#2A2A2A",
			"submenu_item_txt": "#fff",
			"submenu_item_bg_hover": "#222222"
		},
		"dark-blue": {
			"sidebar_bg": "#34495e",
			"user_panel_txt": "#fff",
			"sidebar_top_border": "#142638",
			"sidebar_bottom_border": "#54677a",
			"menu_item_top_border": "#54677a",
			"menu_item_bottom_border": "#142638",
			"menu_item_txt": "#fff",
			"menu_item_bg_hover": "#3d566e",
			"menu_item_bg_active": "#2c3e50",
			"submenu_item_bg": "#ECF0F1",
			"submenu_item_bg_hover": "#E0E7E8",
			"submenu_item_txt": "#333333"
		}
	};

	userStyles.boxes = {
		"green": {
			"bg": "#34d2b1",
			"bg_gradient": "#87e5d1"
		},
		"red": {
			"bg": "#d25b5b",
			"bg_gradient": "#da7575"
		},
		"brown": {
			"bg": "#c76436",
			"bg_gradient": "#d3825d"
		},
		"purple": {
			"bg": "#8f6899",
			"bg_gradient": "#a687ad"
		},
		"gray": {
			"bg": "#5f5f5f",
			"bg_gradient": "#797979"
		},
		"pink": {
			"bg": "#be5779",
			"bg_gradient": "#cc7c96"
		},
		"bright-blue": {
			"bg": "#349cf3",
			"bg_gradient": "#64b3f6"
		},
		"dark-blue": {
			"bg": "#2b3949",
			"bg_gradient": "#3e5369"
		}

	};

	NRS.pages.settings = function() {
		for (var style in userStyles) {
			if (!userStyles.hasOwnProperty(style)) {
				continue;
			}
			var $dropdown = $("#" + style + "_color_scheme");
			$dropdown.empty();
			$dropdown.append("<li><a href='#' data-color=''><span class='color' style='background-color:" + NRS.defaultColors[style] + ";border:1px solid black;'></span>Default</a></li>");
			$.each(userStyles[style], function(key, value) {
				var bg = "";
				if (value.bg) {
					bg = value.bg;
				} else if (value.header_bg) {
					bg = value.header_bg;
				} else if (value.sidebar_bg) {
					bg = value.sidebar_bg;
				}
				$dropdown.append("<li><a href='#' data-color='" + key + "'><span class='color' style='background-color: " + bg + ";border:1px solid black;'></span> " + key.replace("-", " ") + "</a></li>");
			});

			var $span = $dropdown.closest(".btn-group.colors").find("span.text");
			var color = NRS.settings[style + "_color"];
			if (!color) {
				colorTitle = "Default";
			} else {
				var colorTitle = color.replace(/-/g, " ");
				colorTitle = colorTitle.replace(/\w\S*/g, function(txt) {
					return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
				});
			}
			$span.html(colorTitle);
		}

		for (var key in NRS.settings) {
			if (!NRS.settings.hasOwnProperty(key)) {
				continue;
			}
			var setting = $("#settings_" + key);
            if (/_warning/i.test(key) && key != "asset_transfer_warning" && key != "currency_transfer_warning") {
				if (setting.length) {
					setting.val(NRS.convertToNXT(NRS.settings[key]));
				}
			} else if (!/_color/i.test(key)) {
				if (setting.length) {
					setting.val(NRS.settings[key]);
				}
			}
		}

		if (NRS.settings["news"] != -1) {
			$("#settings_news_initial").remove();
		}

		if (NRS.settings["marketplace"] != -1) {
			$("#settings_marketplace_initial").remove();
		}

		if (NRS.inApp) {
			$("#settings_console_log_div").hide();
		}
		if ((NRS.database && NRS.database["name"] == "NRS_USER_DB") || (!NRS.databaseSupport)) {
			$("#settings_db_warning").show();
		}
		NRS.pageLoaded();
	};

	function getCssGradientStyle(start, stop, vertical) {
		var startPosition = (vertical ? "left" : "top");
        var output = "";
		output += "background-image: -moz-linear-gradient(" + startPosition + ", " + start + ", " + stop + ");";
        output += "background-image: -ms-linear-gradient(" + startPosition + ", " + start + ", " + stop + ");";
		output += "background-image: -webkit-gradient(linear, " + (vertical ? "left top, right top" : "0 0, 0 100%") + ", from(" + start + "), to(" + stop + "));";
		output += "background-image: -webkit-linear-gradient(" + startPosition + ", " + start + ", " + stop + ");";
		output += "background-image: -o-linear-gradient(" + startPosition + ", " + start + ", " + stop + ");";
		output += "background-image: linear-gradient(" + startPosition + ", " + start + ", " + stop + ");";
		output += "filter: progid:dximagetransform.microsoft.gradient(startColorstr='" + start + "', endColorstr='" + stop + "', GradientType=" + (vertical ? "1" : "0") + ");";
		return output;
	}

	NRS.updateStyle = function(type, color) {
		var css = "";
		var colors;
		if ($.isPlainObject(color)) {
			colors = color;
		} else {
			colors = userStyles[type][color];
		}
		if (colors) {
			switch (type) {
				case "boxes":
					css += ".small-box { background: " + colors.bg + "; " + getCssGradientStyle(colors.bg, colors.bg_gradient, true) + " }";
					break;
				case "header":
					if (!colors.link_txt) {
						colors.link_txt = "#fff";
					}
					if (!colors.toggle_icon) {
						colors.toggle_icon = "#fff";
					}
					if (!colors.toggle_icon_hover) {
						colors.toggle_icon_hover = "#fff";
					}
					if (!colors.link_txt_hover) {
						colors.link_txt_hover = colors.link_txt;
					}
					if (!colors.link_bg_hover && colors.link_bg) {
						colors.link_bg_hover = colors.link_bg;
					}

					if (!colors.logo_bg) {
						css += ".header { background:" + colors.header_bg + " }";
						if (colors.header_bg_gradient) {
							css += ".header { " + getCssGradientStyle(colors.header_bg, colors.header_bg_gradient) + " }";
						}
						css += ".header .navbar { background: inherit }";
						css += ".header .logo { background: inherit }";
					} else {
						css += ".header .navbar { background:" + colors.header_bg + " }";
						if (colors.header_bg_gradient) {
							css += ".header .navbar { " + getCssGradientStyle(colors.header_bg, colors.header_bg_gradient) + " }";
						}
						css += ".header .logo { background: " + colors.logo_bg + " }";
						if (colors.logo_bg_gradient) {
							css += ".header .logo { " + getCssGradientStyle(colors.logo_bg, colors.logo_bg_gradient) + " }";
						}
					}
					css += ".header .navbar .nav a { color: " + colors.link_txt + (colors.link_bg ? "; background:" + colors.link_bg : "") + " }";
					css += ".header .navbar .nav > li > a:hover, .header .navbar .nav > li > a:focus, .header .navbar .nav > li > a:focus { color: " + colors.link_txt_hover + (colors.link_bg_hover ? "; background:" + colors.link_bg_hover : "") + " }";
					if (colors.link_bg_hover) {
						css += ".header .navbar .nav > li > a:hover { " + getCssGradientStyle(colors.link_bg_hover, colors.link_bg_hover_gradient) + " }";
					}
					css += ".header .navbar .nav > li > ul a { color: #444444; }";
					css += ".header .navbar .nav > li > ul a:hover {  color: " + colors.link_txt_hover + (colors.link_bg_hover ? "; background:" + colors.link_bg_hover : "") + " }";
					css += ".header .navbar .sidebar-toggle .icon-bar { background: " + colors.toggle_icon + " }";
					css += ".header .navbar .sidebar-toggle:hover .icon-bar { background: " + colors.toggle_icon_hover + " }";
					if (colors.link_border) {
						css += ".header .navbar .nav > li { border-left: 1px solid " + colors.link_border + " }";
					}
					if (colors.link_border_inset) {
						css += ".header .navbar .nav > li { border-right: 1px solid " + colors.link_border_inset + " }";
						css += ".header .navbar .nav > li:last-child { border-right:none }";
						css += ".header .navbar .nav { border-left: 1px solid " + colors.link_border_inset + " }";
					}
					if (colors.header_border) {
						css += ".header { border-bottom: 1px solid " + colors.header_border + " }";
					}
					break;
				case "sidebar":
					if (!colors.user_panel_link) {
						colors.user_panel_link = colors.user_panel_txt;
					}
					if (!colors.menu_item_bg) {
						colors.menu_item_bg = colors.sidebar_bg;
					}
					if (!colors.menu_item_bg_active) {
						colors.menu_item_bg_active = colors.menu_item_bg_hover;
					}
					if (!colors.menu_item_txt_hover) {
						colors.menu_item_txt_hover = colors.menu_item_txt;
					}
					if (!colors.menu_item_txt_active) {
						colors.menu_item_txt_active = colors.menu_item_txt_hover;
					}
					if (!colors.menu_item_border_active && colors.menu_item_border_hover) {
						colors.menu_item_border_active = colors.menu_item_border_hover;
					}
					if (!colors.menu_item_border_size) {
						colors.menu_item_border_size = 1;
					}
					css += ".left-side { background: " + colors.sidebar_bg + " }";
					css += ".left-side .user-panel > .info { color: " + colors.user_panel_txt + " }";
					if (colors.user_panel_bg) {
						css += ".left-side .user-panel { background: " + colors.user_panel_bg + " }";
						if (colors.user_panel_bg_gradient) {
							css += ".left-side .user-panel { " + getCssGradientStyle(colors.user_panel_bg, colors.user_panel_bg_gradient) + " }";
						}
					}
					css += ".left-side .user-panel a { color:" + colors.user_panel_link + " }";
					if (colors.sidebar_top_border || colors.sidebar_bottom_border) {
						css += ".left-side .sidebar > .sidebar-menu { " + (colors.sidebar_top_border ? "border-top: 1px solid " + colors.sidebar_top_border + "; " : "") + (colors.sidebar_bottom_border ? "border-bottom: 1px solid " + colors.sidebar_bottom_border : "") + " }";
					}
					css += ".left-side .sidebar > .sidebar-menu > li > a { background: " + colors.menu_item_bg + "; color: " + colors.menu_item_txt + (colors.menu_item_top_border ? "; border-top:1px solid " + colors.menu_item_top_border : "") + (colors.menu_item_bottom_border ? "; border-bottom: 1px solid " + colors.menu_item_bottom_border : "") + " }";
					if (colors.menu_item_bg_gradient) {
						css += ".left-side .sidebar > .sidebar-menu > li > a { " + getCssGradientStyle(colors.menu_item_bg, colors.menu_item_bg_gradient) + " }";
					}
					css += ".left-side .sidebar > .sidebar-menu > li.active > a { background: " + colors.menu_item_bg_active + "; color: " + colors.menu_item_txt_active + (colors.menu_item_border_active ? "; border-left: " + colors.menu_item_border_size + "px solid " + colors.menu_item_border_active : "") + " }";
					if (colors.menu_item_border_hover || colors.menu_item_border_active) {
						css += ".left-side .sidebar > .sidebar-menu > li > a { border-left: " + colors.menu_item_border_size + "px solid transparent }";
					}
					if (colors.menu_item_bg_active_gradient) {
						css += ".left-side .sidebar > .sidebar-menu > li.active > a { " + getCssGradientStyle(colors.menu_item_bg_active, colors.menu_item_bg_active_gradient) + " }";
					}
					css += ".left-side .sidebar > .sidebar-menu > li > a:hover { background: " + colors.menu_item_bg_hover + "; color: " + colors.menu_item_txt_hover + (colors.menu_item_border_hover ? "; border-left: " + colors.menu_item_border_size + "px solid " + colors.menu_item_border_hover : "") + " }";
					if (colors.menu_item_bg_hover_gradient) {
						css += ".left-side .sidebar > .sidebar-menu > li > a:hover { " + getCssGradientStyle(colors.menu_item_bg_hover, colors.menu_item_bg_hover_gradient) + " }";
					}
					css += ".sidebar .sidebar-menu .treeview-menu > li > a { background: " + colors.submenu_item_bg + "; color: " + colors.submenu_item_txt + (colors.submenu_item_top_border ? "; border-top:1px solid " + colors.submenu_item_top_border : "") + (colors.submenu_item_bottom_border ? "; border-bottom: 1px solid " + colors.submenu_item_bottom_border : "") + " }";
					if (colors.submenu_item_bg_gradient) {
						css += ".sidebar .sidebar-menu .treeview-menu > li > a { " + getCssGradientStyle(colors.submenu_item_bg, colors.submenu_item_bg_gradient) + " }";
					}
					css += ".sidebar .sidebar-menu .treeview-menu > li > a:hover { background: " + colors.submenu_item_bg_hover + "; color: " + colors.submenu_item_txt_hover + " }";
					if (colors.submenu_item_bg_hover_gradient) {
						css += ".sidebar .sidebar-menu .treeview-menu > li > a:hover { " + getCssGradientStyle(colors.submenu_item_bg_hover, colors.submenu_item_bg_hover_gradient) + " }";
					}
					break;
			}
		}

		var $style = $("#user_" + type + "_style");
		if ($style[0].styleSheet) {
			$style[0].styleSheet.cssText = css;
		} else {
			$style.text(css);
		}
	};

	$("ul.color_scheme_editor").on("click", "li a", function(e) {
		e.preventDefault();
		var color = $(this).data("color");
		var scheme = $(this).closest("ul").data("scheme");
		var $span = $(this).closest(".btn-group.colors").find("span.text");
		if (!color) {
			colorTitle = "Default";
		} else {
			var colorTitle = color.replace(/-/g, " ");
			colorTitle = colorTitle.replace(/\w\S*/g, function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}
		$span.html(colorTitle);
		if (color) {
			NRS.updateSettings(scheme + "_color", color);
			NRS.updateStyle(scheme, color);
		} else {
			NRS.updateSettings(scheme + "_color");
			NRS.updateStyle(scheme);
		}
	});

	NRS.createLangSelect = function() {
		// Build language select box for settings page, login
		var $langSelBoxes = $('select[name="language"]');
		$langSelBoxes.empty();
		$.each(NRS.languages, function(code, name) {
			$langSelBoxes.append('<option value="' + code + '">' + name + '</option>');
		});
		$langSelBoxes.val(NRS.settings['language']);
	};

	NRS.getSettings = function() {
		if (!NRS.account) {
			NRS.settings = NRS.defaultSettings;
			if (NRS.getCookie("language")) {
				NRS.settings["language"] = NRS.getCookie("language");
			}
			if (NRS.getCookie("themeChoice")) {
				NRS.settings["themeChoice"] = NRS.getCookie("themeChoice");
			}
			NRS.createLangSelect();
			NRS.applySettings();
		} else {
            async.waterfall([
                function (callback) {
                    if (NRS.databaseSupport) {
                        NRS.database.select("data", [{
                            "id": "settings"
                        }], function (error, result) {
                            if (result && result.length) {
                                NRS.settings = $.extend({}, NRS.defaultSettings, JSON.parse(result[0].contents));
                            } else {
                                NRS.database.insert("data", {
                                    id: "settings",
                                    contents: "{}"
                                });
                                NRS.settings = NRS.defaultSettings;
                            }
                            NRS.logConsole("User settings for account " + NRS.convertNumericToRSAccountFormat(NRS.account));
                            for (var setting in NRS.defaultSettings) {
                                if (!NRS.defaultSettings.hasOwnProperty(setting)) {
                                    continue;
                                }
                                var value = NRS.settings[setting];
                                var status = (NRS.defaultSettings[setting] !== value ? "modified" : "default");
                                if (setting.search("password") >= 0) {
                                    value = new Array(value.length + 1).join('*');
                                }
                                NRS.logConsole(setting + " = " + value + " [" + status + "]");
                            }
                            NRS.applySettings();
                            callback(null);
                        });
                    } else {
                        if (NRS.hasLocalStorage) {
                            NRS.settings = $.extend({}, NRS.defaultSettings, JSON.parse(localStorage.getItem("settings")));
                            NRS.logConsole("Loading settings from local storage");
                        } else {
                            NRS.settings = NRS.defaultSettings;
                        }
                        NRS.applySettings();
                        callback(null);
                    }
                },
                function (callback) {
                    for (var schema in NRS.defaultColors) {
                        var color = NRS.settings[schema + "_color"];
                        if (color) {
                            NRS.updateStyle(schema, color);
                        }
                    }
                }
            ], function (err, result) {});

		}
	};

	NRS.applySettings = function(key) {
	    if (!key || key == "themeChoice") {
			var oldlink, newlink;
			var settingsBox = $("#settings_box");
            if(NRS.settings["themeChoice"] == "default"){
				oldlink = document.getElementsByTagName("link").item(3);
				newlink = document.createElement("link");
        		newlink.setAttribute("rel", "stylesheet");
       			newlink.setAttribute("type", "text/css");
        		newlink.setAttribute("href", 'css/app.css');
				document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
				settingsBox.find(".box-success form .box-body .form-group").css("display", "block");
			}
			else if (NRS.settings["themeChoice"] != ""){
				oldlink = document.getElementsByTagName("link").item(3);
				newlink = document.createElement("link");
        		newlink.setAttribute("rel", "stylesheet");
       			newlink.setAttribute("type", "text/css");
        		newlink.setAttribute("href", "css/" + NRS.settings["themeChoice"] + ".css");
				document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
				settingsBox.find(".box-success form .box-body .form-group").css("display", "none");
				settingsBox.find(".box-success form .box-body .form-group:first-child").css("display", "block");
			}
			$("#change_theme").val(NRS.settings["themeChoice"]);
		}
		
		if (!key || key == "language") {
			if ($.i18n.lng() != NRS.settings["language"]) {
				$.i18n.setLng(NRS.settings["language"], null, function() {
					$("[data-i18n]").i18n();
				});
				if (key && window.localstorage) {
					window.localStorage.setItem('i18next_lng', NRS.settings["language"]);
				}
				if (NRS.inApp) {
					parent.postMessage({
						"type": "language",
						"version": NRS.settings["language"]
					}, "*");
				}
			}
		}

		if (!key || key == "submit_on_enter") {
			if (NRS.settings["submit_on_enter"] == "1") {
				$(".modal form:not('#decrypt_note_form_container')").on("submit.onEnter", function(e) {
					e.preventDefault();
					NRS.submitForm($(this).closest(".modal"));
				});
			} else {
				$(".modal form").off("submit.onEnter");
			}
		}

		if (!key || key == "animate_forging") {
            var forgingIndicator = $("#forging_indicator");
            if (NRS.settings["animate_forging"] == "1") {
				forgingIndicator.addClass("animated");
			} else {
				forgingIndicator.removeClass("animated");
			}
		}

		if (!key || key == "news") {
			if (NRS.settings["news"] == "0") {
				$("#news_link").hide();
			} else if (NRS.settings["news"] == "1") {
				$("#news_link").show();
			}
		}
		
		if (!key || key == "items_page") {
			NRS.itemsPerPage = parseInt(NRS.settings["items_page"], 10);
		}

		if (!NRS.inApp && !NRS.downloadingBlockchain) {
			if (!key || key == "console_log") {
				if (NRS.settings["console_log"] == "0") {
					$("#show_console").hide();
				} else {
					$("#show_console").show();
				}
			}
		} else if (NRS.inApp) {
			$("#show_console").hide();
		}

		if (key == "24_hour_format") {
			var $dashboard_dates = $("#dashboard_table a[data-timestamp], #dashboard_blocks_table td[data-timestamp]");

			$.each($dashboard_dates, function() {
				$(this).html(NRS.formatTimestamp($(this).data("timestamp")));
			});
		}

		if (!key || key == "remember_passphrase") {
			if (NRS.settings["remember_passphrase"] == "1") {
				NRS.setCookie("remember_passphrase", 1, 1000);
			} else {
				NRS.deleteCookie("remember_passphrase");
			}
		}
		if (!key || key == "admin_password") {
			if (NRS.settings["admin_password"] != "") {
				NRS.updateForgingStatus();
			}
		}
	};

	NRS.updateSettings = function(key, value) {
		if (key) {
			NRS.settings[key] = value;

			if (key == "themeChoice") {
				NRS.setCookie("themeChoice", value, 1000);
			}
			if (key == "language") {
				NRS.setCookie("language", value, 1000);
			}
		}

		if (NRS.databaseSupport) {
			NRS.database.update("data", {
				contents: JSON.stringify(NRS.settings)
			}, [{
				id: "settings"
			}]);
		} else if (NRS.hasLocalStorage) {
			localStorage.setItem("settings", JSON.stringify(NRS.settings));
		}
		NRS.applySettings(key);
	};

	NRS.newDefaultStyle = function() {
		NRS.updateStyle('header',userStyles.header['dark-blue']);
		NRS.updateStyle('sidebar',userStyles.sidebar['dark-blue']);
		NRS.updateStyle('boxes',userStyles.boxes['dark-blue']);
	}

	$("#settings_box select, #welcome_panel select[name='language'], #settings_admin_password").on("change", function(e) {
		e.preventDefault();
        NRS.updateSettings($(this).attr("name"), $(this).val());
	});

	$("#settings_box").find("input[type=text]").on("input", function() {
		var key = $(this).attr("name");
		var value = $(this).val();
		if (/_warning/i.test(key) && key != "asset_transfer_warning" && key != "currency_transfer_warning") {
			value = NRS.convertToNQT(value);
		}
		NRS.updateSettings(key, value);
	});

	return NRS;
}(NRS || {}, jQuery));