/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"combtc/zwm_tuketim_hareketleri/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
