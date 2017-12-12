{{each}}
<tr data-id="{{$value.productVo.id}}" data-cartid="{{$value.cartId}}">
    <td class="box-check"><input type="checkbox" name="toggle-checkboxes" class="list-check"></td>
    <td class="goodstitle">
        <div class="goods-item clearfix">
            <img src="{{$value.productVo.onePhoto}}" class="fl">
            <span class="goodsname fl">{{$value.productVo.name}}</span>
        </div>
    </td>
    <td class="unitprice">¥{{$value.productVo.price}}.00</td>
    <td class="addredu-num">
        <div class="goods-num clearfix">
            <a href="javascript:void(0);" class="reduceNum fl">-</a>
            <input type="text" class="details-number fl" maxlength="4" value="{{$value.buynum}}" onkeyup="this.value=this.value.replace(/\D/g,'')" onafterpaste="this.value=this.value.replace(/\D/g,'')">
            <input type="hidden" class="stock-num" value="{{$value.productVo.num}}">
            <a href="javascript:void(0);" class="addNum fr">+</a>
            <div class="error">您所填写的宝贝数量超过库存！</div>
        </div>
    </td>
    <td class="subtotal">¥{{$value.productVo.price * $value.buynum}}.00</td>
    <td class="operation">
        <span class="del-btn">删除</span>
    </td>
</tr>
{{/each}}