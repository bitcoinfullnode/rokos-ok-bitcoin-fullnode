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

var __entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
};

String.prototype.escapeHTML = function() {
	return String(this).replace(/[&<>"'\/]/g, function(s) {
		return __entityMap[s];
	});
}

String.prototype.unescapeHTML = function() {
	return String(this).replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace('&quot;', '"').replace('&#39;', "'").replace('&#x2F;', "/");
}

String.prototype.nl2br = function() {
	return String(this).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
}

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

Number.prototype.pad = function(size) {
	var s = String(this);
	if (typeof(size) !== "number") {
		size = 2;
	}

	while (s.length < size) {
		s = "0" + s;
	}
	return s;
}

/*
Array.prototype.diff = function(a) {
	return this.filter(function(i) {
		return a.indexOf(i) < 0;
	});
};*/

if (typeof Object.keys !== "function") {
	(function() {
		Object.keys = Object_keys;

		function Object_keys(obj) {
			var keys = [],
				name;
			for (name in obj) {
				if (obj.hasOwnProperty(name)) {
					keys.push(name);
				}
			}
			return keys;
		}
	})();
}

$.fn.hasAttr = function(name) {
	var attr = this.attr(name);

	return attr !== undefined && attr !== false;
};

//https://github.com/bryanwoods/autolink-js/blob/master/autolink.js
(function() {
	var autoLink,
		__slice = [].slice;

	autoLink = function() {
		var entityMap = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': '&quot;',
			"'": '&#39;'
		};

		var output = String(this).replace(/[&<>"']/g, function(s) {
			return entityMap[s];
		});

		var k, linkAttributes, option, options, pattern, v;
		options = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
		pattern = /(^|\s)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;

		return output.replace(pattern, "$1<a href='$2' target='_blank'>$2</a>");
	};

	String.prototype['autoLink'] = autoLink;
}).call(this);