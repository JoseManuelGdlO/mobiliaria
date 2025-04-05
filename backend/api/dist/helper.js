"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helper = void 0;
var helper;
(function (helper) {
    function getOffset(currentPage = 1, listPerPage) {
        return (currentPage - 1) * listPerPage;
    }
    helper.getOffset = getOffset;
    function emptyOrRows(rows) {
        if (!rows) {
            return [];
        }
        return rows;
    }
    helper.emptyOrRows = emptyOrRows;
})(helper || (exports.helper = helper = {}));
