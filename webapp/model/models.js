sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {
		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createFLPModel: function() {
			var fnGetuser = jQuery.sap.getObject("sap.ushell.Container.getUser"),
				userId = fnGetuser ? fnGetuser().getId() : false,
				oModel = new JSONModel({
					id: userId
				});
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}
	};

});