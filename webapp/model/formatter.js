sap.ui.define([
    "sap/ui/base/ManagedObject",
    "com/btc/zwmtuketimhareketleri/controller/BaseController"
], function (
    ManagedObject,
    BaseController
) {
    "use strict";

    return {
        numberUnit: function (sValue) {
            if (!sValue) {
                return "";
            }

            var isFloat = sValue.split(".");
            if (isFloat[1] === "000") {
                return parseInt(sValue);
            } else {
                return parseFloat(sValue).toFixed(2);
            }
        },

        changeNumber: function (iNumber) {
            return iNumber.replaceAll(".", "").replace(",", ".");
        },
        convertStringToFloat: function (sString, isFiori) {
            sString = sString.trim();
            return isFiori ? parseFloat(sString.replace(/\./g, '').replace(',', '.')) : parseFloat(sString);
        },


        compareTwoStringAsFloat: function (sString1, sString2, isType) {

            //sString1 fiori user entry
            //sString2 abap tarafından gelen num char. 
            try {
                if (typeof sString1 !== 'string' || typeof sString2 !== 'string') {
                    console.error("Invalid input: Both parameters must be strings.");
                    return false; // Hata durumunda varsayılan bir değer döndürüyoruz
                }

                // Sayı formatına uygun hale getirme (örn: 1.234,56 → 1234.56)
                let num1 = this.convertStringToFloat(sString1, true),
                    num2 = this.convertStringToFloat(sString2, isType);
                // Geçerli sayılar olup olmadığını kontrol et
                if (isNaN(num1) || isNaN(num2)) {
                    console.error("Invalid number format:", sString1, sString2);
                    return false;
                }

                return num1 > num2;
            } catch (error) {
                console.error("Error in compareTwoStringAsFloat:", error);
                return false;
            }
        }
    }
});