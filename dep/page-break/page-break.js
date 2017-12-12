/**
 * Created by hui on 2016/12/9 0009.
 */
var pageVTpl = require('./tpl/page-break');
var util = require('utilspare/util');
require('./page-break.less')
//初始化
var DEFAULT_NUM = 1, POINT = '...', PREV = '-', NEXT = '+';
//存放element对象的数组
var eleObj = [];
/*
 * 分页对象
 * */
function pageBreak(element, currentPageNum, pageCount, callback, scope) {
    this.isClick = false;
    this.ele = element;
    this.currentPN = currentPageNum || DEFAULT_NUM;
    this.pageCN = pageCount || 1;
    this._callback = callback;
    this._scope = scope || null;
}
pageBreak.prototype = {
    init: function () {
        var self = this;
        self.renderTemplate();
        if (!self.isClick) {
            self.initBtn();
        }
        self.isClick = true;
    },
    renderTemplate: function () {
        var self = this;
        var pagedata = {
            data: [],
            pre: PREV,
            next: NEXT
        };
        if (self.pageCN <= 6) {
            for (var i = 1; i <= self.pageCN; i++) {
                pagedata.data.push(i);
            }
        } else {
            if (self.currentPN >= 1 && self.currentPN < 5) {
                pagedata.data.push(1, 2, 3, 4, 5, POINT, self.pageCN);
            } else if (self.currentPN >= 5 && (self.pageCN - self.currentPN) + 1 < 5) {
                pagedata.data.push(1, POINT, self.pageCN - 4, self.pageCN - 3, self.pageCN - 2, self.pageCN - 1, self.pageCN);
            } else if (self.currentPN >= 5 && (self.pageCN - self.currentPN) + 1 >= 5) {
                pagedata.data.push(1, POINT, self.currentPN - 1, self.currentPN, self.currentPN + 1, POINT, self.pageCN)
            }
        }
        self.ele.html(pageVTpl(pagedata));
        self.setClass();
    },
    setClass: function () {
        var self = this;
        self.ele.find('.page a').each(function () {
            if ($(this).attr("data-num") == self.currentPN) {
                $(this).addClass("blueBg");
            } else if ($(this).attr("data-num") == POINT) {
                $(this).addClass("ellipsis");
            }
        });
    },
    setOwnProperty: function (currentPageNum, pageCount, callback, scope) {
        this.currentPN = currentPageNum || DEFAULT_NUM;
        this.pageCN = pageCount || 1;
        this._callback = callback;
        this._scope = scope || null;
    },
    initBtn: function () {
        var self = this;
        self.ele.delegate('.page a', 'click', function () {
            if ($(this).attr("data-num") == PREV) {
                if (!!--self.currentPN) {
                    //执行回调函数
                    if (!!self._callback) {
                        self._callback.call(self._scope, self.currentPN);//将当前的页号传递给后台
                    }
                } else {
                    self.currentPN = 1;
                }
            } else if ($(this).attr("data-num") == NEXT) {
                if (++self.currentPN <= self.pageCN) {
                    self._callback.call(self._scope, self.currentPN);//将当前的页号传递给后台
                } else {
                    self.currentPN = self.pageCN;
                }
            } else if (typeof ($(this).attr("data-num") - 0) == "number") {
                self.currentPN = Number($(this).attr("data-num"));
                self._callback.call(self._scope, self.currentPN);//将当前的页号传递给后台
            }
        });
        self.ele.delegate('.page .jump', 'click', function () {
            self._callback.call(self._scope, parseInt($(this).prev('input').val()));//将当前的页号传递给后台
        });
    }
};

/*
 * currentPageNum传递的当前页码
 * pageCount =totalCount/pageSize 页数
 * element 分页对象
 * callback回调函数
 * scope 作用域
 * */
module.exports = {
    init: function (element, currentPageNum, pageCount, callback, scope) {
        var page, isNewPage = false;
        currentPageNum = (currentPageNum - pageCount > 0 ? pageCount : currentPageNum);//这个是在删除的时候考虑的
        util.forEach(eleObj, function (item) {
            if (item) {
                if (item.key == element.attr("id")) {
                    page = item.value;
                    page.setOwnProperty(currentPageNum, pageCount, callback, scope);
                    isNewPage = true;
                }
            }
        });
        if (!isNewPage) {
            var obj = {
                key: element.attr("id"),
                value: new pageBreak(element, currentPageNum, pageCount, callback, scope)
            };
            page = obj.value;
            eleObj.push(obj);
        }
        return page.init();
    }
};