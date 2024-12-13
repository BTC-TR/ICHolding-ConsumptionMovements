sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/ui/core/mvc/Controller",
    "com/btc/zwmtuketimhareketleri/model/models",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    ManagedObject,
    Controller,
    models,
    Filter,
    FilterOperator
) {
    "use strict";

    return Controller.extend("com.btc.zwmtuketimhareketleri.controller.BaseController", {
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        _callFunction: async function (
            sEntity,
            sMethod,
            oDataModel,
            oURLParameters
        ) {
            return new Promise((fnResolve, fnReject) => {
                sap.ui.core.BusyIndicator.show();
                const mParameters = {
                    method: sMethod,
                    urlParameters: oURLParameters,
                    success: fnResolve,
                    error: fnReject,
                };
                oDataModel.callFunction(sEntity, mParameters);
            });
        },

        _readMultiData: async function (entitySet, filters, oDataModel) {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show();
                const options = {
                    filters: filters,
                    success: resolve,
                    error: reject,
                };
                oDataModel.read(entitySet, options);
            });
        },

        _readData: async function (sPath, oDataModel) {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show();
                const options = {
                    success: resolve,
                    error: reject,
                };
                oDataModel.read(sPath, options);
            });
        },

        _createData: async function (sEntitySet, oEntry, oDataModel) {
            sap.ui.core.BusyIndicator.show(0);
            return new Promise(function (resolve, reject) {
                const options = {
                    success: resolve,
                    error: reject
                };
                oDataModel.create(sEntitySet, oEntry, options);
            });
        },

        _focusInput: function (inputId, timeout) {
            setTimeout(() => {
                this.getView().byId(inputId).focus();
            }, timeout);
        },
        _clearHeader: function () {
            this._jsonModel.setProperty("/Header", models.createJSONModel().getData().Header);
        },

        _getHareketTuru: function () {

        },

        _getKaynakDepoAdresi: function () {

        },

        _checkBrcode: function (sBarkoce) {
            this._checkStock();
        },

        _checkStock: function () {

        },

        _addBarcode: function (oHeaderData) {

        },

        _deleteRowTable: function (aSelectedRows) {

        },

        _saveTransfer: function (aRows) {

        },

        _prepareValueHelpDialog: function (oEvent, fragmentName) {
            this._valueHelpInput = oEvent.getSource();
            this._valueHelpDialog = sap.ui.xmlfragment(this.getView().getId(), "com.btc.zwmtuketimhareketleri.view.Fragments.ValueHelp." + fragmentName, this);
            this.getView().addDependent(this._valueHelpDialog);
            this._valueHelpDialog.open();
            this._afterFocus(this._valueHelpDialog);
        },

        _afterFocus: function (valueHelp) {
            setTimeout(function () {
                var oSearchField = valueHelp._oSearchField;
                if (oSearchField) {
                    oSearchField.focus();
                }
            }, 500);
        },

        onSelectDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter([
                new Filter("Lgpla", FilterOperator.Contains, sValue)
            ], false);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        onSelectDialogConfirm: function (oEvent) {
            var sDescription,
                sTitle,
                sType,
                oSelectedItem = oEvent.getParameter("selectedItem"),
                sInputId = this._valueHelpInput.getId();
            oEvent.getSource().getBinding("items").filter([]);
            if (!oSelectedItem) {
                return;
            }
            sTitle = oSelectedItem.getTitle();
            sDescription = oSelectedItem.getDescription();
            sType = oSelectedItem.getInfo();

            this._valueHelpInput.setValue(sTitle);
            this._valueHelpInput.setDescription(sDescription);

        },

        onSelectDialogCancel: function (oEvent) {
            oEvent.getSource()._dialog.close();
        }
    });
});