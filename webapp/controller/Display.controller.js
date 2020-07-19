sap.ui.define([
	"BudgetAllocation/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"BudgetAllocation/model/formatter",
	"sap/ui/core/library",
	"sap/ui/unified/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/Sorter"
], function(BaseController, JSONModel, MessageToast, MessageBox, Fragment, formatter, CoreLibrary, UnifiedLibrary, Filter, FilterOperator,
	FilterType, Sorter) {
	"use strict";

	return BaseController.extend("BudgetAllocation.controller.Display", {
		formatter: formatter,
		onInit: function() {
			// configurationModel will contain data like user role and view mode(view budget, change and edit budget , not authorized to see any budgets)
			this.configurationModel = new JSONModel();
			this.filterModel = new JSONModel();
			this.budgetModel = new JSONModel();
			this.historyModel = new JSONModel();
			this.filterSuggestionFlag = false;

			this.oDataModel = this.getOwnerComponent().getModel();

			this.setModel(this.configurationModel, "configurationModel");
			this.setModel(this.filterModel, "filterModel");
			this.setModel(this.budgetModel, "budgetModel");
			this.setModel(this.historyModel, "historyModel");

			this.configurationModel.setData(this.retriveDefaultConfSetting());
			this.filterModel.setData(this.retriveDefaultFilters());
			this.retriveBudgetAllocation();
		},

		// retrive all budgets that are assigned to this user
		retriveBudgetAllocation: function() {

			// var configurationModel = this.getModel("configurationModel"),

			var emptyAndAuthFlag = false,
				notAuth = this.getTextFromResourceBundle("notAuthStatus"),
				that = this,
				BDGPath = "/BdgAllocationSet";

			this.configurationModel.setProperty("/busyIndicatorFlag", true);

			this.oDataModel.read(BDGPath, {

				filters: [],
				method: "GET",
				success: function(data) {
					var budgetArr = data.results;

					budgetArr.forEach(function(x) {
						// check if user dosen't have any role to view this app 
						if (x.SalesDesc === notAuth) {
							// check if user dosen't have any role to view this app 
							emptyAndAuthFlag = true;
							that.configurationModel.setProperty("/role", "NotAuthorized");
							return;
						}
						if (x.BdgId === "0000000000") {
							emptyAndAuthFlag = true;
							return;
						}
						x.OriginalBdg = formatter.roundAmount(x.OriginalBdg, x.Currency);
						// check if user has role to change 
						if (x.Changeable === "X") {
							x.oldOriginal = x.OriginalBdg;
							that.configurationModel.setProperty("/role", "Change");
						}

					});

					if (!emptyAndAuthFlag) {
						that.budgetModel.setData(data);

						if (!that.filterSuggestionFlag) {
							that.setSuggestionOfFilters(budgetArr);
							that.filterSuggestionFlag = true;
						}
					}

					that.configurationModel.setProperty("/busyIndicatorFlag", false);
					return;
				},
				error: function(error) {
					MessageToast.show(that.getTextFromResourceBundle("failureBdgReq"));
					that.configurationModel.setProperty("/busyIndicatorFlag", false);
					return;
				}

			});
		},

		onHistoryPress: function(oEvent) {

			var indexPath = oEvent.getSource().getBindingContext("budgetModel").sPath,
				selectedIndex = this.getIndexOfIem(indexPath),
				budgetId = this.budgetModel.getProperty("/results")[selectedIndex].BdgId,
				currency = this.budgetModel.getProperty("/results")[selectedIndex].Currency,
				budgetHistoryPath = "/BdgAllocationSet('" + budgetId + "')/AllocationToHistoryNav",
				that = this;

			this.configurationModel.setProperty("/busyIndicatorFlag", true);

			this._HistoryFragment = sap.ui.xmlfragment(this.getView().getId(), "BudgetAllocation.view.Budget_History", this);
			this.getView().addDependent(this._HistoryFragment);
			this._HistoryFragment.setModel(this.configurationModel);
			this._HistoryFragment.setModel(this.historyModel);

			this.oDataModel.read(budgetHistoryPath, {
				method: "GET",
				success: function(data) {

					that.historyModel.setData(data);
					that.historyModel.setProperty("/Currency", currency);
					that.configurationModel.setProperty("/busyIndicatorFlag", false);
					that._HistoryFragment.open();
				},

				error: function(error) {
					MessageToast.show(that.getTextFromResourceBundle("failureHistReq"));
					that.configurationModel.setProperty("/busyIndicatorFlag", false);
					that._HistoryFragment.destroy();
					return;
				}

			});

		},

		onSavePress: function(oEvent) {

			var oTable = this.getView().byId("budgetTableId"),
				oItems = oTable.mAggregations.items,
				budgetArr = this.budgetModel.getProperty("/results"),
				that = this,
				changedBudegetArr = [],
				requestPath = "/BdgHistorySet",
				oChangedBudget = {},
				oValidator = [];
			// 			
			// construct array of all original budget cells 
			oItems.forEach(function(x) {
				x.OriginalBdg = formatter.roundAmount(x.OriginalBdg, x.Currency);
				var itemOb = {
					id: x.mAggregations.cells[6],
					type: "float",
					max: 16
				};
				oValidator.push(itemOb);
			});

			// validate original budget is float, has digits between 1 to 16
			var validatorFlag = this.validator(oValidator);
			if (!validatorFlag) {
				MessageToast.show(this.getTextFromResourceBundle("bdgNotValid"));
				return;
			}

			
			// collect only budgets that are changed
			budgetArr.forEach(function(budget) {

				var item = {};
				item.BdgId = budget.BdgId;
				item.BdgMonth = budget.BdgMonth;
				item.UserId = budget.UserId;
				item.SalesDesc = budget.SalesDesc;
				item.SalesChannel = budget.SalesChannel;
				item.RemaningBdg = budget.RemaningBdg;
				item.OriginalBdg = budget.OriginalBdg;
				item.ExtendedBdg = budget.ExtendedBdg;
				item.DnType = budget.DnType;
				item.Currency = budget.Currency;
				item.CompanyName = budget.CompanyName;
				item.CompanyCode = budget.CompanyCode;
				item.Changeable = budget.Changeable;
				item.Brand = budget.Brand;
				item.BdgYear = budget.BdgYear;
				item.CreationTime = budget.CreationTime;
				item.CreationDate = budget.CreationDate;

				if (budget.Changeable === "X" && budget.oldOriginal !== budget.OriginalBdg) {
					changedBudegetArr.push(item);
				}
				item = {};
			});
			
			if(changedBudegetArr.length === 0){
                MessageBox.warning(this.getTextFromResourceBundle("noOrgBdgChanged"));
                return;
			}

			// get randomHeader to use Create deep insert 
			oChangedBudget = this.randomHeaderData(changedBudegetArr[0]);

			oChangedBudget.BdgAllocationSet = changedBudegetArr;

			this.configurationModel.setProperty("/busyIndicatorFlag", true);

			this.oDataModel.create(requestPath, oChangedBudget, {

				success: function(data) {

					if (data.UserId === "") {

						MessageBox.error(that.getTextFromResourceBundle("failChange"));
						that.configurationModel.setProperty("/busyIndicatorFlag", false);

					} else {

						MessageBox.success(that.getTextFromResourceBundle("succChange"), {
							actions: [MessageBox.Action.OK],
							onClose: function() {
								// make app in view mode after all budgets saved Successfully.
								that.configurationModel.setProperty("/mode", "View");
								that.configurationModel.setProperty("/busyIndicatorFlag", false);
								that.retriveBudgetAllocation();
							}

						});

					}
				},
				error: function(oError) {
					MessageToast.show(that.getTextFromResourceBundle("failChange"));
					that.configurationModel.setProperty("/busyIndicatorFlag", false);
				}
			});

		},

		onChangePress: function(oEvent) {
			this.setAppMode("Change");
		},

		onCloseDialog: function(oEvent) {
			this._HistoryFragment.destroy();
		},

		onCancelPress: function(oEvent) {

			var oTable = this.getView().byId("budgetTableId"),
				oItems = oTable.mAggregations.items;

			this.setAppMode("View");
			this.retriveBudgetAllocation();
			this.clearStateOfAllInputs(oItems);
		},

		// set mode of app to change or view
		setAppMode: function(oMode) {
			// var configurationModel = this.getModel("configurationModel");
			this.configurationModel.setProperty("/mode", oMode);
		},

		// doesn't have header data so we use Random Data to call create deep inset
		randomHeaderData: function(rBudget) {
			var randomHeader = {};
			randomHeader.LineId = rBudget.BdgId;
			randomHeader.BdgId = rBudget.BdgId;
			randomHeader.UserId = rBudget.UserId;
			randomHeader.PreviousBdg = rBudget.OriginalBdg;
			randomHeader.CurrentBdg = rBudget.OriginalBdg;
			randomHeader.CreationDate = rBudget.CreationDate;
			randomHeader.CreationTime = rBudget.CreationTime;
			return randomHeader;
		},

		setSuggestionOfFilters: function(arr) {
			var dntypeArr = [],
				salesChannelArr = [],
				brandArr = [],
				dntypes = [],
				salesChannels = [],
				brands = [],
				dntypeObj = {},
				salesObj = {},
				brandObj = {};

			arr.forEach(function(x) {

				if (!dntypeArr.includes(x.DnType)) {
					// x.DnType = formatter.captalizeFirstChar(x.DnType);
					dntypeArr.push(x.DnType);
				}

				if (!salesChannelArr.includes(x.SalesDesc)) {
					// x.SalesDesc = formatter.captalizeFirstChar(x.SalesDesc);
					salesChannelArr.push(x.SalesDesc);
				}

				if (!brandArr.includes(x.Brand)) {
					// x.Brand = formatter.captalizeFirstChar(x.Brand);
					brandArr.push(x.Brand);
				}

			});

			dntypeArr.forEach(function(x) {
				dntypeObj.DnType = formatter.captalizeFirstChar(x);
				dntypes.push(dntypeObj);
				dntypeObj = {};
			});

			salesChannelArr.forEach(function(x) {
				salesObj.SalesDesc = formatter.captalizeFirstChar(x);
				salesChannels.push(salesObj);
				salesObj = {};
			});

			brandArr.forEach(function(x) {
				brandObj.Brand = formatter.captalizeFirstChar(x);
				brands.push(brandObj);
				brandObj = {};
			});

			this.filterModel.setProperty("/DNTypes", dntypes);
			this.filterModel.setProperty("/SalesChannels", salesChannels);
			this.filterModel.setProperty("/Brands", brands);

		},

		onFilterPress: function(oEvent) {
			this.configurationModel.setProperty("/busyIndicatorFlag", true);
			this._filterFragment = sap.ui.xmlfragment(this.getView().getId(), "BudgetAllocation.view.Filter", this);
			this.getView().addDependent(this._filterFragment);
			this._filterFragment.setModel(this.configurationModel);
			this._filterFragment.setModel(this.filterModel);
			this._filterFragment.open();
			this.configurationModel.setProperty("/busyIndicatorFlag", false);
		},

		onSortPress: function(oEvent) {
			this.configurationModel.setProperty("/busyIndicatorFlag", true);
			this._sortFragment = sap.ui.xmlfragment(this.getView().getId(), "BudgetAllocation.view.Sort", this);
			this.getView().addDependent(this._sortFragment);
			this._sortFragment.setModel(this.configurationModel);
			this._sortFragment.open();
			this.configurationModel.setProperty("/busyIndicatorFlag", false);
		},

		onSortConfirm: function(oEvent) {
			this.configurationModel.setProperty("/busyIndicatorFlag", true);
			var oTable = this.getView().byId("budgetTableId"),
				oParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter(oParams.sortItem.getKey(), oParams.sortDescending);

			oBinding.sort([oSorter]);
			this.configurationModel.setProperty("/busyIndicatorFlag", false);

		},

		onApplyFilter: function(oEvent) {

			this.handleAddingFilters();

			var dnTypeFilter = this.filterModel.getProperty("/SelectedDnType"),
				channelFilter = this.filterModel.getProperty("/SelectedSalesChannel"),
				brandFilter = this.filterModel.getProperty("/SelectedBrand"),
				createdByFilter = this.filterModel.getProperty("/UserId"),
				createdFrom = this.filterModel.getProperty("/CreatedFrom").split('.')[1],
				createdTo = this.filterModel.getProperty("/CreatedTo").split('.')[1],
				createdFromMonthFilter = createdFrom ? this.addLeftZero(createdFrom, 2) : "undefined",
				createdToMonthFilter = createdTo ? this.addLeftZero(createdTo, 2) : "undefined",
				createdFromYearFilter = createdFrom ? this.filterModel.getProperty("/CreatedFrom").split('.')[2] : "undefined",
				createdToYearFilter = createdTo ? this.filterModel.getProperty("/CreatedTo").split('.')[2] : "undefined",
				oFilters = [],
				dateValidator = "",
				oTable = this.getView().byId("budgetTableId");

			if (dnTypeFilter) {
				oFilters.push(new Filter("DnType", FilterOperator.Contains, dnTypeFilter));
			}
			if (channelFilter) {
				oFilters.push(new Filter("SalesDesc", FilterOperator.Contains, channelFilter));
			}
			if (brandFilter) {
				oFilters.push(new Filter("Brand", FilterOperator.Contains, brandFilter));
			}
			if (createdByFilter) {
				oFilters.push(new Filter("UserId", FilterOperator.Contains, createdByFilter));
			}

			if (createdFromMonthFilter !== "undefined" || createdToMonthFilter !== "undefined") {
				if (createdFromMonthFilter !== "undefined" && createdToMonthFilter !== "undefined") {

					dateValidator = this.validteDatePicker(createdFromMonthFilter, createdFromYearFilter, createdToMonthFilter, createdToYearFilter);

					if (dateValidator) {
						oFilters.push(new Filter("BdgMonth", FilterOperator.BT, createdFromMonthFilter, createdToMonthFilter));
						oFilters.push(new Filter("BdgYear", FilterOperator.BT, createdFromYearFilter, createdToYearFilter));
					} else {
						MessageToast.show(this.getTextFromResourceBundle("invalidDate"));
						return;
					}

				} else {
					if (createdFromMonthFilter !== "undefined") {
						oFilters.push(new Filter("BdgMonth", FilterOperator.GE, createdFromMonthFilter));
						oFilters.push(new Filter("BdgYear", FilterOperator.GE, createdFromYearFilter));
					} else {
						oFilters.push(new Filter("BdgMonth", FilterOperator.LE, createdToMonthFilter));
						oFilters.push(new Filter("BdgYear", FilterOperator.LE, createdToYearFilter));
					}
				}

			}

			oTable.getBinding("items").filter(oFilters);
			this._filterFragment.destroy();
		},

		onClearFilter: function(oEvent) {
			// this.filterModel.setData(this.retriveDefaultFilters);
			var oTable = this.getView().byId("budgetTableId");
			oTable.getBinding("items").filter([]);
			this.clearAllAppliedFilters();
			this._filterFragment.destroy();
		},

		onCancelFilter: function(oEvent) {
			// this.byId("dnTypeInputId").data("customData", oKey);
			this._filterFragment.destroy();
		}
	});
});