sap.ui.define(function() {
	"use-strict";

	return {
		//define color of amount dependent on original amount
		budgetState: function(amount, orgAmount) {
			amount = parseInt(amount);
			orgAmount = parseInt(orgAmount);
			if (amount === 0) {
				return "Error";
			} else if (amount === orgAmount) {
				return "Success";
			} else {
				return "Warning";
			}
		},

		// define month color dependent on current month
		monthState: function(month) {

			var currentMonth = new Date().getMonth();
			month = parseInt(month);
			currentMonth = parseInt(currentMonth);
			if (month === currentMonth) {
				return "Warning";
			} else if (month < currentMonth) {
				return "Error";
			} else {
				return "Success";
			}
		},

		// round number dependant on currecy 
		roundAmount: function(amount, currency) {

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

		// convert milliseconds (ms) to hours, minutes seconds and milliseconds like to 360000 to 01:01 
		timeFormatter: function(duration) {
			var ms = duration.ms,
				milliseconds = parseInt((ms % 1000) / 100),
				seconds = Math.floor((ms / 1000) % 60),
				minutes = Math.floor((ms / (1000 * 60)) % 60),
				hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

			hours = (hours < 10) ? "0" + hours : hours;
			minutes = (minutes < 10) ? "0" + minutes : minutes;
			seconds = (seconds < 10) ? "0" + seconds : seconds;

			return hours + ":" + minutes;
		},

		// remove left zeros from string
		leftShiftZeros: function(number) {
			return parseInt(number);
		}
	};
});