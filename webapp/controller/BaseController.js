/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function(Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("ExtensionApproval.ExtensionApproval.controller.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */

		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		getTextFromResourceBundle: function(oName, param) {
			return this.getResourceBundle().getText(oName, param);
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("master", {}, true);
			}
		},

		confirmMultiReq: function(workItems, decision, decisionCode) {

			var oModel = this.getOwnerComponent().getModel(),
				confirmPath = "/ApproveMultiReq",
				that = this,
				statusFlag = false,
				itemsLength = workItems.length;

			that.getView().setBusy(true);

			// 			var promise = new Promise(function(resolved, rejected) {

			oModel.callFunction(confirmPath, {
				method: "POST",
				async: false,
				urlParameters: {
					RequestIDs: workItems,
					Decision: decisionCode
				},
				success: function(data) {
					// 		resolved(true);
					statusFlag = true;
					that.getView().setBusy(false);
					if (itemsLength > 1) {
						MessageBox.success(that.getTextFromResourceBundle("allActionSucc", decision));

					} else {
						MessageBox.success(that.getTextFromResourceBundle("actionSucc", decision));
					}

				},
				error: function(error) {
					// 		rejected(false);
					that.getView().setBusy(false);
					if (itemsLength > 1) {
						MessageBox.error(that.getTextFromResourceBundle("allActionFail", decision));
					} else {
						MessageBox.error(that.getTextFromResourceBundle("decisionFail", decision));
					}

				}
			});

		},

		validteDatePicker: function(dayFrom, monthFrom, yearFrom, dayTo, monthTo, yearTo) {

			if (yearFrom >= yearTo) {
				if (yearFrom === yearTo) {
					if (monthFrom >= monthTo) {
						if (monthFrom === monthTo) {
							if (dayFrom > dayTo) {
								return false;
							} else {
								return true;
							}
						} else {
							return false;
						}
					} else {
						return true;
					}
				} else {
					return false;
				}
			} else {

				return true;
			}

		}

	});

});