<thead>
    <tr>
        <th>
            <span>全部订单</span>
            <span>订单详情</span>
        </th>
        <th>收货人</th>
        <th>金额</th>
        <th>全部状态</th>
        <th>操作</th>
    </tr>
</thead>
{{each list as item i}}
<tbody data-id="{{item.id}}">
    <tr class="sep-row"><td colspan="5"></td></tr>
    <tr class="tr-th">
        <td colspan="5">
            <span class="gap"></span>
            <span class="dealtime" title="2017-10-29 21:26:14">{{item.createTime}}</span>
            <span class="number">订单号：
                <a>{{item.orderId}}</a>
            </span>
        </td>
    </tr>
    {{each item.items as tag i}}
    {{if item.items.length <= 1}}
    <tr class="tr-bd">
        <td>
           <div class="goods-item">
               <div class="p-img">
                   <a><img class="" src="{{item.items[i].productPhoto}}" width="60" height="60"></a>
               </div>
               <div class="p-msg">
                   <div class="p-name">
                       <a class="a-link">{{item.items[i].name}}</a>
                   </div>
                   <div class="p-extra"></div>
               </div>
           </div>
           <div class="goods-number">x{{item.items[i].buynum}}</div>
        </td>
        <td rowspan="1">
            <div class="consignee tooltip">
                <span class="txt">{{item.receiver}}</span>
            </div>
        </td>
        <td rowspan="1">
            <div class="amount">
                <span>总额 ￥{{item.payMoney}}.00</span> <br>
                {{if item.payMode == '01'}}
                <span class="ftx-13">货到付款</span>
                {{else if item.payMode == '02'}}
                <span class="ftx-13">在线支付</span>
                {{/if}}
            </div>
        </td>
        <td rowspan="1" data-id="{{item.id}}">
            <div class="status">
                {{if item.status == '0'}}
                <span class="order-status ftx-02">未支付</span><br>
                <a class="order_detail">订单详情</a>
                {{else if item.status == '1'}}
                <span class="order-status ftx-02">付款成功</span><br>
                {{else if item.status == '2'}}
                <span class="order-status ftx-02">已经发货</span><br>
                {{else if item.status == '5'}}
                <span class="order-status ftx-02">交易成功</span><br>
                {{else if item.status == '9'}}
                <span class="order-status ftx-02">订单取消</span><br>
                {{else}}
                <a>已关闭</a>
                {{/if}}
            </div>
        </td>
        <td rowspan="1" data-id="{{item.id}}" data-addressid="{{item.addressId}}" data-productid="{{item.items[i].productId}}">
            <div class="operate">
                {{if item.status == '0'}}
                <a data-money="{{item.payMoney}}.0" class="now-pay">去支付</a>
                <a class="a-link order-cancel" href="javascript:void(0);">取消订单</a>
                {{else if item.status == '9'}}
                <a class="btn-5 order-confirm">已完成</a><br>
                {{else if item.status == '5'}}
                <a class="btn-5 order-confirm">去评价</a><br>
                {{else if item.status == '2'}}
                <a class="btn-5 order-confirm qr-sh">确认收货</a><br>
                {{else if item.status == '1'}}
                <a class="btn-5 order-confirm qr-sh">确认收货</a><br>
                {{/if}}
            </div>
        </td>
    </tr>
    {{else}}
    <tr class="tr-bd tr-hd{{[i]+''}} hd-tr">
        <td>
           <div class="goods-item">
               <div class="p-img">
                   <a><img class="" src="{{item.items[i].productPhoto}}" width="60" height="60"></a>
               </div>
               <div class="p-msg">
                   <div class="p-name">
                       <a class="a-link">{{item.items[i].name}}</a>
                   </div>
                   <div class="p-extra"></div>
               </div>
           </div>
           <div class="goods-number">x{{item.items[i].buynum}}</div>
        </td>
        <td rowspan="{{item.items.length}}">
            <div class="consignee tooltip">
                <span class="txt" style="line-height: {{(item.items.length*10)-10}};">{{item.receiver}}</span>
            </div>
        </td>
        <td rowspan="{{item.items.length}}">
            <div class="amount" style="margin-top: {{item.items.length*10*item.items.length}}px;">
                <span>总额 ￥{{item.payMoney}}.00</span> <br>
                {{if item.payMode == '01'}}
                <span class="ftx-13">货到付款</span>
                {{else if item.payMode == '02'}}
                <span class="ftx-13">在线支付</span>
                {{/if}}
            </div>
        </td>
        <td rowspan="{{item.items.length}}" data-id="{{item.id}}">
            <div class="status"  style="margin-top: {{item.items.length*10*item.items.length}}px;">
                {{if item.status == '0'}}
                <span class="order-status ftx-02">未支付</span><br>
                <a class="order_detail">订单详情</a>
                {{else if item.status == '1'}}
                <span class="order-status ftx-02">付款成功</span><br>
                {{else if item.status == '2'}}
                <span class="order-status ftx-02">已经发货</span><br>
                {{else if item.status == '5'}}
                <span class="order-status ftx-02">交易成功</span><br>
                {{else if item.status == '9'}}
                <span class="order-status ftx-02">订单取消</span><br>
                {{else}}
                <a>已关闭</a>
                {{/if}}
            </div>
        </td>
        <td rowspan="{{item.items.length}}" data-id="{{item.id}}" data-addressid="{{item.addressId}}" data-productid="{{item.items[i].productId}}">
            <div class="operate" style="margin-top: {{item.items.length*10*item.items.length}}px;">
                {{if item.status == '0'}}
                <a data-money="{{item.payMoney}}.0" class="now-pay">去支付</a>
                <a class="a-link order-cancel" href="javascript:void(0);">取消订单</a>
                {{else if item.status == '9'}}
                <a class="btn-5 order-confirm">已完成</a><br>
                {{else if item.status == '5'}}
                <a class="btn-5 order-confirm">去评价</a><br>
                {{else if item.status == '2'}}
                <a class="btn-5 order-confirm">确认收货</a><br>
                {{else if item.status == '1'}}
                <a class="btn-5 order-confirm">确认收货</a><br>
                {{/if}}
            </div>
        </td>
    </tr>
    {{/if}}
    {{/each}}
</tbody>
{{/each}}