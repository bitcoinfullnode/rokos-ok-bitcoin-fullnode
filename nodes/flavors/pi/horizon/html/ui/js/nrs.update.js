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
	NRS.normalVersion = {};
	NRS.betaVersion = {};
	NRS.isOutdated = false;

	NRS.checkAliasVersions = function() {
		if (NRS.downloadingBlockchain) {
			$("#nrs_update_explanation span").hide();
			$("#nrs_update_explanation_blockchain_sync").show();
			return;
		}
		if (NRS.isTestNet) {
			$("#nrs_update_explanation span").hide();
			$("#nrs_update_explanation_testnet").show();
			return;
		}

		//Get latest version nr+hash of normal version
		NRS.sendRequest("getAlias", {
			"aliasName": "nrsversion"
		}, function(response) {
			if (response.aliasURI && (response = response.aliasURI.split(" "))) {
				NRS.normalVersion.versionNr = response[0];
				NRS.normalVersion.hash = response[1];

				if (NRS.betaVersion.versionNr) {
					NRS.checkForNewVersion();
				}
			}
		});

		//Get latest version nr+hash of beta version
		NRS.sendRequest("getAlias", {
			"aliasName": "nrsbetaversion"
		}, function(response) {
			if (response.aliasURI && (response = response.aliasURI.split(" "))) {
				NRS.betaVersion.versionNr = response[0];
				NRS.betaVersion.hash = response[1];

				if (NRS.normalVersion.versionNr) {
					NRS.checkForNewVersion();
				}
			}
		});

		if (NRS.inApp) {
			//user uses an old version which does not supply the platform / version
			if (NRS.appPlatform == "" || NRS.appVersion == "" || version_compare(NRS.appVersion, "NHZ V3.2", "<")) {
				$("#secondary_dashboard_message").removeClass("alert-success").addClass("alert-danger").html("A new version of the Horizon Wallet application is available for download <a href='https://horizonplatform.io/wallets/' target='_blank'>here</a>. You must install it manually due to changes in the NRS startup procedure.").show();
			}
		}
	}

	NRS.checkForNewVersion = function() {
		var installVersusNormal, installVersusBeta, normalVersusBeta;

		if (NRS.normalVersion && NRS.normalVersion.versionNr) {
			installVersusNormal = NRS.versionCompare(NRS.state.version, NRS.normalVersion.versionNr);
		}
		if (NRS.betaVersion && NRS.betaVersion.versionNr) {
			installVersusBeta = NRS.versionCompare(NRS.state.version, NRS.betaVersion.versionNr);
		}

		$("#nrs_update_explanation > span").hide();

		$("#nrs_update_explanation_wait").attr("style", "display: none !important");

		$(".nrs_new_version_nr").html(NRS.normalVersion.versionNr).show();
		$(".nrs_beta_version_nr").html(NRS.betaVersion.versionNr).show();

		if (installVersusNormal == -1 && installVersusBeta == -1) {
			NRS.isOutdated = true;
			$("#nrs_update").html("Outdated!").show();
			$("#nrs_update_explanation_new_choice").show();
		} else if (installVersusBeta == -1) {
			NRS.isOutdated = false;
			$("#nrs_update").html("New Beta").show();
			$("#nrs_update_explanation_new_beta").show();
		} else if (installVersusNormal == -1) {
			NRS.isOutdated = true;
			$("#nrs_update").html("Outdated!").show();
			$("#nrs_update_explanation_new_release").show();
		} else {
			NRS.isOutdated = false;
			$("#nrs_update_explanation_up_to_date").show();
		}
	}

	NRS.versionCompare = function(v1, v2) {
		if (v2 == undefined) {
			return -1;
		} else if (v1 == undefined) {
			return -1;
		}

        v1 = v1.substr(5);
		v2 = v2.substr(5);
		
		//https://gist.github.com/TheDistantSea/8021359 (based on)
		var v1last = v1.slice(-1);
		var v2last = v2.slice(-1);

		if (v1last == 'e') {
			v1 = v1.substring(0, v1.length - 1);
		} else {
			v1last = '';
		}

		if (v2last == 'e') {
			v2 = v2.substring(0, v2.length - 1);
		} else {
			v2last = '';
		}

		var v1parts = v1.split('.');
		var v2parts = v2.split('.');

		function isValidPart(x) {
			return /^\d+$/.test(x);
		}

		if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
			return NaN;
		}

		v1parts = v1parts.map(Number);
		v2parts = v2parts.map(Number);

		for (var i = 0; i < v1parts.length; ++i) {
			if (v2parts.length == i) {
				return 1;
			}
			if (v1parts[i] == v2parts[i]) {
				continue;
			} else if (v1parts[i] > v2parts[i]) {
				return 1;
			} else {
				return -1;
			}
		}

		if (v1parts.length != v2parts.length) {
			return -1;
		}

		if (v1last && v2last) {
			return 0;
		} else if (v1last) {
			return 1;
		} else if (v2last) {
			return -1;
		} else {
			return 0;
		}
	}

	NRS.supportsUpdateVerification = function() {
		if ((typeof File !== 'undefined') && !File.prototype.slice) {
			if (File.prototype.webkitSlice) {
				File.prototype.slice = File.prototype.webkitSlice;
			}

			if (File.prototype.mozSlice) {
				File.prototype.slice = File.prototype.mozSlice;
			}
		}

		// Check for the various File API support.
		if (!window.File || !window.FileReader || !window.FileList || !window.Blob || !File.prototype.slice || !window.Worker) {
			return false;
		}

		return true;
	}

	NRS.verifyClientUpdate = function(e) {
		e.stopPropagation();
		e.preventDefault();

		var files = null;

		if (e.originalEvent.target.files && e.originalEvent.target.files.length) {
			files = e.originalEvent.target.files;
		} else if (e.originalEvent.dataTransfer.files && e.originalEvent.dataTransfer.files.length) {
			files = e.originalEvent.dataTransfer.files;
		}

		if (!files) {
			return;
		}

		$("#nrs_update_hash_progress").css("width", "0%");
		$("#nrs_update_hash_progress").show();

		var worker = new Worker("js/crypto/sha256worker.js");

		worker.onmessage = function(e) {
			if (e.data.progress) {
				$("#nrs_update_hash_progress").css("width", e.data.progress + "%");
			} else {
				$("#nrs_update_hash_progress").hide();
				$("#nrs_update_drop_zone").hide();

				if (e.data.sha256 == NRS.downloadedVersion.hash) {
					$("#nrs_update_result").html($.t("success_hash_verification")).attr("class", " ");
				} else {
					$("#nrs_update_result").html($.t("error_hash_verification")).attr("class", "incorrect");
				}

				$("#nrs_update_hash_version").html(NRS.downloadedVersion.versionNr);
				$("#nrs_update_hash_download").html(e.data.sha256);
				$("#nrs_update_hash_official").html(NRS.downloadedVersion.hash);
				$("#nrs_update_hashes").show();
				$("#nrs_update_result").show();

				NRS.downloadedVersion = {};

				$("body").off("dragover.nrs, drop.nrs");
			}
		};

		worker.postMessage({
			file: files[0]
		});
	}

	NRS.downloadClientUpdate = function(version) {
		if (version == "release") {
			NRS.downloadedVersion = NRS.normalVersion;
		} else {
			NRS.downloadedVersion = NRS.betaVersion;
		}

		if (NRS.inApp) {
			parent.postMessage({
				"type": "update",
				"update": {
					"type": version,
					"version": NRS.downloadedVersion.versionNr,
					"hash": NRS.downloadedVersion.hash
				}
			}, "*");
			$("#nrs_modal").modal("hide");
		} else {
			var versionNumber = NRS.downloadedVersion.versionNr.toLowerCase();
            $("#nrs_update_iframe").attr("src", "https://github.com/NeXTHorizon/hz-source/releases/download/hz-v" + versionNumber.substr(5) + "/hz-v" + versionNumber.substr(5) + ".zip");
			$("#nrs_update_explanation").hide();
			$("#nrs_update_drop_zone").show();

			$("body").on("dragover.nrs", function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (e.originalEvent && e.originalEvent.dataTransfer) {
					e.originalEvent.dataTransfer.dropEffect = "copy";
				}
			});

			$("body").on("drop.nrs", function(e) {
				NRS.verifyClientUpdate(e);
			});

			$("#nrs_update_drop_zone").on("click", function(e) {
				e.preventDefault();

				$("#nrs_update_file_select").trigger("click");

			});

			$("#nrs_update_file_select").on("change", function(e) {
				NRS.verifyClientUpdate(e);
			});
		}

		return false;
	}

	return NRS;
}(NRS || {}, jQuery));