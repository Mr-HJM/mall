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
{{each}}
<tbody data-id="{{$value.id}}">
    <tr class="sep-row"><td colspan="5"></td></tr>
    <tr class="tr-th">
        <td colspan="5">
            <span class="gap"></span>
            <span class="dealtime" title="2017-10-29 21:26:14">{{$value.createTime}}</span>
            <span class="number">订单号：
                <a>{{$value.orderId}}</a>
            </span>
        </td>
    </tr>
    <tr class="tr-bd">
        <td>
            <div class="goods-item">
                <div class="p-img">
                    <a><img class="" src="{{$value.items[0].productPhoto}}" width="60" height="60"></a>
                </div>
                <div class="p-msg">
                    <div class="p-name">
                        <a class="a-link">{{$value.items[0].name}}</a>
                    </div>
                    <div class="p-extra"></div>
                </div>
            </div>
            <div class="goods-number">x{{$value.items[0].buynum}}</div>
        </td>
        <td rowspan="1">
            <div class="consignee tooltip">
                <span class="txt">{{$value.receiver}}</span>
            </div>
        </td>
        <td rowspan="1">
            <div class="amount">
                <span>总额 ￥{{$value.items[0].buyPrice}}.00</span> <br>
                {{if $value.payMode == '01'}}
                <span class="ftx-13">货到付款</span>
                {{else if $value.payMode == '02'}}
                <span class="ftx-13">在线支付</span>
                {{/if}}
            </div>
        </td>
        <td rowspan="1" data-id="{{$value.id}}">
            <div class="status">
            	{{if $value.status == '0'}}
            	<span class="order-status ftx-02">未支付</span><br>
                <a class="order_detail">订单详情</a>
            	{{else if $value.status == '1'}}
            	<span class="order-status ftx-02">付款成功</span><br>
            	{{else if $value.status == '2'}}
            	<span class="order-status ftx-02">已经发货</span><br>
            	{{else if $value.status == '5'}}
            	<span class="order-status ftx-02">交易成功</span><br>
            	{{else if $value.status == '9'}}
            	<span class="order-status ftx-02">订单取消</span><br>
                {{else}}
                <a>已关闭</a>
            	{{/if}}
            </div>
        </td>
        <td rowspan="1" data-id="{{$value.id}}" data-addressid="{{$value.addressId}}" data-productid="{{$value.items[0].productId}}">
            <div class="operate">
            	{{if $value.status == '0'}}
                <a class="now-pay">去支付</a>
            	<a class="a-link order-cancel" href="javascript:void(0);">取消订单</a>
            	{{else if $value.status == '5' || $value.status == '9'}}
            	<a class="btn-5 order-confirm">已完成</a><br>
            	{{else if $value.status == '2'}}
            	<a class="btn-5 order-confirm">确认收货</a><br>
                {{else if $value.status == '1'}}
                <a class="btn-5 order-confirm">确认收货</a><br>
            	{{/if}}
            </div>
        </td>
    </tr>
</tbody>
{{/each}}