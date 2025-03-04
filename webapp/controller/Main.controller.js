sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/btc/zwmtuketimhareketleri/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/btc/zwmtuketimhareketleri/model/formatter"
],
    function (Controller,
        BaseController,
        MessageBox,
        MessageToast,
        formatter) {
        "use strict";

        return BaseController.extend("com.btc.zwmtuketimhareketleri.controller.Main", {
            formatter: formatter,
            onInit: function () {
                this.getOwnerComponent().getRouter().getRoute("RouteMain").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function () {
                this._jsonModel = this.getModel("jsonModel");
                this._oDataModel = this.getModel();
                this._userId = sap.ushell.Container.getService("UserInfo").getId();
                this._oTable = this.getView().byId("idTransferTable");
                this._oMatnrInput = this.getView().byId("idMatnrInput");
                this._oChargInput = this.getView().byId("idChargInput");

                // this._getUserWarehouse();
                this._getHareketTuru();
                // this._getKaynakDepoAdresi();
                this._getMasrafYeri();
                this._getSiparisNo();
                this._getPyp();
                this._getMatnr()
                this._getCharg()
                this._getItems()
                this._getDepoYeri()
                this._focusInput("idHareketTuruInput", 300);
            },

            onSlaytSwitchChange: function (oEvent) {
                oEvent.getParameter("state") ? [this._jsonModel.setProperty("/Visibility/SlaytB", true), this._jsonModel.setProperty("/Visibility/SlaytA", false), this._focusInput("idMatnrInput", 200), this._clearHeader()] : [this._jsonModel.setProperty("/Visibility/SlaytB", false), this._jsonModel.setProperty("/Visibility/SlaytA", true), this._focusInput("idHareketTuruInput", 200), this._oChargInput.destroyTokens(), this._oMatnrInput.destroyTokens()]
            },

            onHareketTuruInputSubmit: function (oEvent) {
                let that = this,
                    sValue = oEvent.getParameter("value").toUpperCase(),
                    aHareketTurleri = this._jsonModel.getData().HareketTuruSH,
                    oHareketTuru = aHareketTurleri.find((item) => {
                        return item.Bwart === sValue
                    });

                if (oHareketTuru) {
                    oEvent.oSource.setValue(oHareketTuru.Bwart);
                    oEvent.oSource.setDescription(oHareketTuru.Btext);
                    this._focusInput("idBarkodInput", 200)
                    this._jsonModel.setProperty("/BarkodEditable", true)

                    // if (oHareketTuru.Bwart === "A09" || oHareketTuru.Bwart === "A30" || oHareketTuru.Bwart === "221" || oHareketTuru.Bwart === "221Q") {
                    if (oHareketTuru.Bwart === "A09" || oHareketTuru.Bwart === "A30" || oHareketTuru.Bwart === "A09Q" || oHareketTuru.Bwart === "A30Q") {
                        this._jsonModel.setProperty("/SiparisNoVisibility", true)
                    } else {
                        this._jsonModel.setProperty("/SiparisNoVisibility", false)
                    }
                    // } else {
                    if (oHareketTuru.Bwart !== "A09" || oHareketTuru.Bwart !== "A30") {
                        this._jsonModel.setProperty("/SiparisNoVisibility", false)
                    }
                    this._jsonModel.setProperty("/SiparisNoVisibility", false)
                    // }

                    oHareketTuru.Bwart === "221" || oHareketTuru.Bwart === "A09" || oHareketTuru.Bwart === "A30" ? [this._jsonModel.setProperty("/PypEditable", true), this._jsonModel.setProperty("/PypVisibility", true)] : [this._jsonModel.setProperty("/PypEditable", false), this._jsonModel.setProperty("/PypVisibility", false)]


                } else {
                    oEvent.getSource().setValue("");
                    oEvent.getSource().setDescription("");
                    oEvent.getSource().focus();
                    return MessageToast.show(this.getResourceBundle().getText("HAREKET_TURU_BULUNAMADI"))
                }
            },

            onKaynakDepoAdresiInputSubmit: function (oEvent) {
                let that = this,
                    sValue = oEvent.getParameter("value"),
                    aKayndakDepolar = this._jsonModel.getData().KaynakDepoAdresiSH,
                    oKAaynakDepo = aKayndakDepolar.find((item) => {
                        return item.Lgpla === sValue.toUpperCase()
                    });

                if (oKAaynakDepo) {
                    oEvent.getSource().setValue(sValue.toUpperCase());
                    this._jsonModel.setProperty("/Lgtyp", oKAaynakDepo.Lgtyp)
                    this._focusInput("idBarkodInput", 300);
                    this._getItems();
                } else {
                    oEvent.getSource().setValue("");
                    oEvent.getSource().focus();
                    return MessageToast.show(this.getResourceBundle().getText("DEPO_ADRESI_BULUNAMADI"))
                }
            },

            onBarkodInputSubmit: function (oEvent) {
                this._checkBrcode(oEvent.getParameter("value"), this._jsonModel.getData().Header.KaynakDepoAdresi, this._jsonModel.getData().Lgtyp, this._jsonModel.getData().Header.HareketTuru);
                this._focusInput("idPypMasrafYeriInput", 300);
            },

            onBarkodInputLiveChange: function (oEvent) {
                this._checkBrcode(oEvent.getParameter("value"), this._jsonModel.getData().Header.KaynakDepoAdresi, this._jsonModel.getData().Lgtyp, this._jsonModel.getData().Header.HareketTuru);
                this._focusInput("idPypMasrafYeriInput", 300);
            },

            onPypMasrafYeriInputSubmit: function (oEvent) {
                let that = this,
                    sValue = oEvent.getParameter("value"),
                    aMasrafYeriSH = this._jsonModel.getData().MasrafYeriSH,
                    oMasrafYeri = aMasrafYeriSH.find((item) => {
                        return item.Kostl === sValue.toUpperCase()
                    });

                if (oMasrafYeri) {
                    oEvent.getSource().setValue(sValue.toUpperCase());
                    this._jsonModel.getData().SiparisNoVisibility ? this._focusInput("idSiparisNoInput", 300) : this._focusInput("idMiktarInput", 300);

                } else {
                    oEvent.getSource().setValue("");
                    oEvent.getSource().focus();
                    return MessageToast.show(this.getResourceBundle().getText("MASRAF_YERI_BULUNAMADI"))
                }
            },

            onSiparisNoInputSubmit: function (oEvent) {
                let that = this,
                    sValue = oEvent.getParameter("value"),
                    aSiparisNoSH = this._jsonModel.getData().SiparisNoSH,
                    oSiparisNo = aSiparisNoSH.find((item) => {
                        return item.Aufnr === sValue.toUpperCase()
                    });

                if (oSiparisNo) {
                    oEvent.getSource().setValue(sValue.toUpperCase());
                    this._focusInput("idMiktarInput", 300);
                } else {
                    oEvent.getSource().setValue("");
                    oEvent.getSource().focus();
                    return MessageToast.show(this.getResourceBundle().getText("SIPARIS_BULUNAMADI"))
                }
            },

            onMengeInputSubmit: function (oEvent) {
                let oHeaderData = this._jsonModel.getData().Header,
                    validate = true,
                    that = this;

                Object.entries(oHeaderData).forEach(([key, value]) => {
                    if (key === "Charg" || key === "StokBilgi" || key === "HareketTuruTanim" || key === "Pyp" || key === "MasrafYeriTanim") {
                        //
                    } else {
                        if (!value) {
                            return validate = false
                        }
                    }
                })

                if (!validate) {
                    return MessageBox.error(this.getResourceBundle().getText("ZORUNLU_ALANLARI_DOLDURUNUZ"))
                }

                if (this._jsonModel.getData().SiparisNoVisibility && this._jsonModel.getData().SiparisNo === "") {
                    return MessageBox.error(this.getResourceBundle().getText("ZORUNLU_ALANLARI_DOLDURUNUZ"))
                }
                if (oHeaderData.Menge === "0") {
                    return MessageToast.show(this.getResourceBundle().getText("MIKTAR_0_GIRILEMEZ"))
                }

                if (formatter.compareTwoStringAsFloat(oHeaderData.Menge, oHeaderData.StokBilgi, true)) {
                    return MessageBox.error(this.getResourceBundle().getText("GIRILEN_MIKTAR_STOKTAN_BUYUK_OLAMAZ", formatter.convertStringToFloat(oHeaderData.StokBilgi, true).toLocaleString("tr-TR")))
                }

                this._addBarcode(this._jsonModel.getData().Header);
                this._focusInput("idBarkodInput", 300);
            },

            onTemizleButtonPress: function () {
                this._clearHeader();
                this._jsonModel.setProperty("/SiparisNoVisibility", false)
                this._jsonModel.setProperty("/SiparisNo", "")
                this._jsonModel.setProperty("/SiparisTanim", "")
                this._jsonModel.setProperty("/PypEditable", false)
                this._focusInput("idHareketTuruInput", 200)

                this._getItems()
            },

            onSilButtonPress: function (oEvent) {
                if (oEvent.getSource().getParent().getParent().getSelectedContexts().length === 0) {
                    return MessageBox.error(this.getResourceBundle().getText("SATIR_SECINIZ"));
                }

                this._deleteRowTable(oEvent.getSource().getParent().getParent().getSelectedContexts());
            },

            onKaydetButtonPress: function () {
                if (this._oTable.getItems().length === 0) {
                    return MessageBox.error(this.getResourceBundle().getText("ISLENECEK_VERI_YOK"))
                }

                this._kaydetDialog = sap.ui.xmlfragment(this.getView().getId(), "com.btc.zwmtuketimhareketleri.view.Fragments.Dialog.BelgeKayit", this);
                this.getView().addDependent(this._kaydetDialog);

                this._kaydetDialog.open();

            },

            onIptalButtonPress: function (oEvent) {
                oEvent.oSource.getParent().close();
            },

            onKaydetBelgeButtonPress: function () {
                if (!this._jsonModel.getData().BelgeTarihi || !this._jsonModel.getData().BelgeMetni) {
                    return sap.m.MessageBox.error(this.getResourceBundle().getText("ZORUNLU_ALANLARI_DOLDURUN"))
                }
                this._saveTransfer(this._oTable.getItems());
            },

            onAddButtonPress: function () {
                let aMatnrs = this.getView().byId("idMatnrInput").getTokens(),
                    aChargs = this.getView().byId("idChargInput").getTokens(),
                    sHareketTuru = this._jsonModel.getData().Header.HareketTuru;
                if (aMatnrs.length === 0 && aChargs.length === 0) {
                    return MessageToast.show(this.getResourceBundle().getText("MALZEME_VE_CHARG_GIRIN"));
                }

                if (!sHareketTuru) {
                    return MessageToast.show(this.getResourceBundle().getText("HAREKET_TURU_SECINIZ"));
                }

                this._getAdresStok(aMatnrs, aChargs, sHareketTuru);

                this._adresStok = sap.ui.xmlfragment(this.getView().getId(), "com.btc.zwmtuketimhareketleri.view.Fragments.Dialog.AdresVeStok", this);
                this.getView().addDependent(this._adresStok);

                this._adresStok.open();
            },
            onVermeInputChange: function (oEvent) {
                let sValue = oEvent.getSource().getValue(),
                    oRow = oEvent.getSource().getParent().getBindingContext("jsonModel").getObject(),
                    iIndex = oEvent.getSource().getParent().getBindingContextPath().split("/")[2],
                    sOldMenge = this._jsonModel.getProperty("/AdresStokVeMalzemeBackup/" + iIndex + "/Verme");

                if (sValue === "0,00") {
                    return MessageToast.show(this.getResourceBundle().getText("MIKTAR_0_GIRILEMEZ"))
                }

                if (formatter.compareTwoStringAsFloat(sValue, sOldMenge, false)) {
                    oEvent.getSource().getParent().setSelected(false);
                    oEvent.getSource().getParent().setHighlight("None");
                    oEvent.getSource().setValue("")
                    oEvent.getSource().focus()
                    return sap.m.MessageBox.error(this.getResourceBundle().getText("GIRILEN_MIKTAR_STOKTAN_BUYUK_OLAMAZ", formatter.convertStringToFloat(sOldMenge, true).toLocaleString("tr-TR")));
                }

                oEvent.getSource().getParent().setSelected(true);
                oEvent.getSource().getParent().setHighlight("Success");
            },

            onClearButtonPress: function (oEvent) {
                this._jsonModel.setProperty("/AdresStokVeMalzeme", JSON.parse(JSON.stringify(this._jsonModel.getProperty("/AdresStokVeMalzemeBackup"))));
                this._jsonModel.refresh(true)
                let oTable = oEvent.getSource().getParent().getContent()[0];
                oTable.removeSelections();
                oTable.getItems().forEach((item) => {
                    item.setHighlight("None");
                })
            },

            onTamamlaButtonPress: function (oEvent) {
                let aSelectedItems = oEvent.getSource().getParent().getContent()[0].getSelectedItems(),
                    aSelectedItemsData = aSelectedItems.map((item) => {
                        return item.getBindingContext("jsonModel").getObject()
                    });

                this._multiSelectedItems = aSelectedItemsData;

                if (aSelectedItems.length === 0) {
                    return MessageToast.show(this.getResourceBundle().getText("SECIM_YAPILMADI"));
                }

                // this._jsonModel.setProperty("/Header/KaynakDepoAdresi", aSelectedItemsData[0].Lgpla);

                this._kullaniciGiris = sap.ui.xmlfragment(this.getView().getId(), "com.btc.zwmtuketimhareketleri.view.Fragments.Dialog.KullaniciGirisi", this);
                this.getView().addDependent(this._kullaniciGiris);
                this._kullaniciGiris.open();

            },
            _cancelKullaniciGirisiDialog: function (oEvent) {
                oEvent.oSource.getParent().close();
            },
            _confirmKullaniciGirisiDialog: function (oEvent) {
                let sMasrafYeri = oEvent.oSource.getParent().getContent()[0].getContent()[1].getValue(),
                    sSiparis = oEvent.oSource.getParent().getContent()[0].getContent()[3].getValue(),
                    sPyp = oEvent.oSource.getParent().getContent()[0].getContent()[5].getValue();

                this._multiSelectedItems.forEach((item) => {
                    item.MasrafYeri = sMasrafYeri;
                    item.Siparis = sSiparis;
                    if (sPyp) {
                        item.Pyp = sPyp;
                    }
                })

                oEvent.oSource.getParent().close();
                this._addMultiBarcode(this._multiSelectedItems);
                this._adresStok.close();
            },
            onEditButtonPress: function (oEvent) {
                if (!this._kalemDuzenle) {
                    this._kalemDuzenle = sap.ui.xmlfragment(this.getView().getId(), "com.btc.zwmtuketimhareketleri.view.Fragments.Dialog.KalemDuzenle", this);
                    this.getView().addDependent(this._kalemDuzenle);
                }
                this._kalemDuzenle.open();
                this._editedRowData = oEvent.getSource().getBindingContext("jsonModel").getObject();
                this._editedRowData.Menge = parseFloat(this._editedRowData.Menge).toLocaleString("tr-TR")
                this._jsonModel.setProperty("/EditedData", this._editedRowData);

                this._getEditedStock(this._editedRowData);
                setTimeout(() => {
                    this._kalemDuzenle.getContent()[0].getContent()[13].focus();
                }, 300);
            },

            onKaydetButtonEditPress: function (oEvent) {

                if (this._editedRowData.Menge === "0") {
                    return MessageToast.show(this.getResourceBundle().getText("MIKTAR_0_GIRILEMEZ"))
                }

                if (formatter.compareTwoStringAsFloat(this._editedRowData.Menge, this._jsonModel.getData().EditedDataStock, true)) {
                    return MessageBox.error(this.getResourceBundle().getText("GIRILEN_MIKTAR_STOKTAN_BUYUK_OLAMAZ", formatter.convertStringToFloat(this._jsonModel.getData().EditedDataStock, true).toLocaleString("tr-TR")))
                }

                if (!this._jsonModel.getData().EditedDataStock) {
                    return MessageBox.error(this.getResourceBundle().getText("STOK_BULUNAMADI"))
                }
                this._editRow(this._editedRowData);
            },

            onIptalButtonPress: function (oEvent) {
                oEvent.getSource().getParent().close();
                this._getItems();
            },
        });
    });
