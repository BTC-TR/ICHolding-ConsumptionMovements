sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
],
    function (JSONModel, Device) {
        "use strict";

        return {
            /**
             * Provides runtime info for the device the UI5 app is running on as JSONModel
             */
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },

            createJSONModel: function () {
                return new JSONModel({
                    SiparisNoVisibility: false,
                    PypVisibility: false,
                    SiparisNo: "",
                    SiparisTanim: "",
                    PypEditable: false,
                    Header: {
                        HareketTuru: "",
                        HareketTuruTanim: "",
                        KaynakDepoAdresi: "",
                        Barkod: "",
                        Matnr: "",
                        Maktx: "",
                        Charg: "",
                        Pyp_MasrafYeri: "",
                        Pyp: "",
                        MasrafYeriTanim: "",
                        Menge: "",
                        Meins: "",
                        StokBilgi: "",
                    },
                    TransferTablosu: []
                })
            }
        };

    });