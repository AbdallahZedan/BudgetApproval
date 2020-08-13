sap.ui.define([], function() {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function(sValue, currency) {
			
			if (!sValue) {
				return "";
			}
            
			switch (currency) {
				case "SAR":
				case "USD":
				case "GBP":
				case "EUR":
					sValue =parseFloat(parseFloat(sValue).toFixed(2));
					break;
				default:
					sValue = parseFloat(parseFloat(sValue).toFixed(3));
			}

			return sValue;
		},

		formatDate: function(oDate) {

			if (oDate !== null && oDate !== undefined) {
				return oDate.substr(4, 2) + "-" + oDate.substr(6, 2) + "-" + oDate.substr(0, 4);
			} else {
				return "";
			}
		},

		formatDate2: function(oDate) {
			if (oDate !== null && oDate !== undefined) {
				return oDate.substr(6, 2) + "-" + oDate.substr(4, 2) + "-" + oDate.substr(0, 4);
			} else {
				return "";
			}
		},

		filterFormatDate: function(oDate) {

			if (oDate !== null && oDate !== undefined) {
				// oDate = oDate.replace(/\./g, "");
				return oDate.substr(3, 3) + oDate.substr(0, 3) + oDate.substr(6, 4);
			} else {
				return "";
			}

		},

		formatDateTime: function(sDate, sTime) {
			return sTime.substring(0, 2) + ":" + sTime.substring(2, 4) + ":" + sTime.substring(4, 6) + ", " + sDate.substr(6, 2) + "/" + sDate.substr(
				4, 2) + "/" + sDate.substr(0, 4);
		},

		setStateText: function(oStateText) {
			var state = "Success";
			switch (oStateText) {
				case this.getTextFromResourceBundle("Pending"):
					state = "Warning";
					break;
				case this.getTextFromResourceBundle("Reject"):
					state = "Error";
					break;
				default:
					break;
			}
			return state;
		},

		status: function(sValue) {

			if (sValue === "APPROVED") {

				return "Success";

			} else if (sValue === "RELEASED" || sValue === "ACTIVATED" || sValue === "STARTED") {

				return "Warning";

			} else if (sValue === "DELETED" || sValue === "REJECTED") {

				return "Error";

			} else {
				return "Error";

			}

		},

		// round number dependant on currecy 
		roundAmount: function(amount, currency) {

			if (amount === undefined) {
				return "";
			}
			switch (currency) {
				case "SAR":
				case "USD":
				case "GBP":
				case "EUR":
					amount = parseFloat(amount).toFixed(2).toString().concat("\t" + currency);
					break;
				default:
					amount = parseFloat(amount).toFixed(3).toString().concat("\t" + currency);
			}

			return amount;
		},

		roundAmount2: function(amount, currency) {

			if (amount === null) {
				return "";
			}
			switch (currency) {
				case "SAR":
				case "USD":
				case "GBP":
				case "EUR":
					amount = parseFloat(amount).toFixed(2);
					break;
				default:
					amount = parseFloat(amount).toFixed(3);
			}

			return amount;
		},
		// capital first letter of words
		captalizeFirstChar: function(str, type) {

			if (str === undefined) {
				return "";
			}

			var lower = String(str).toLowerCase();
			if (type === "oneWord") {
				return lower.replace(/(^|\. *)(\w)/g, function(firstChar) {
					return firstChar.toUpperCase();
				});

			} else {
				return lower.replace(/(^| )(\w)/g, function(firstChar) {
					return firstChar.toUpperCase();
				});
			}
		},

		// add month to year 
		concatMonthYear: function(sMonth, sYear) {
			var date;
			if (sMonth === undefined || sYear === undefined) {
				date = "";
			} else {
				date = sMonth + "-" + sYear;
			}

			return date;

		},

		actionVisibility: function(oValue) {

			if (oValue === "STARTED") {
				return true;
			} else {
				return false;
			}

		},

		getProcessFlowIntro: function(oValue) {

			if (parseInt(oValue) === 1) {
				return this.getTextFromResourceBundle("Reviewer");
			} else if (parseInt(oValue) === 2) {
				return this.getTextFromResourceBundle("Approval_1");
			} else if (parseInt(oValue) === 3) {
				return this.getTextFromResourceBundle("Approval_2");
			} else if (parseInt(oValue) === 4) {
				return this.getTextFromResourceBundle("Approval_3");
			} else if (parseInt(oValue) === 5) {
				return this.getTextFromResourceBundle("CFO");
			} else if (parseInt(oValue) === 6) {
				return this.getTextFromResourceBundle("CEO");
			}
			// if (parseInt(oValue) < 6) {
			// return "Approver " + (parseInt(oValue));
			// }
			// return "Reviewer " + (parseInt(oValue) - 5);
		}

	};

});