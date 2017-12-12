{{each}}
	<div class="goods_list clearfix">
		<div class="goods_list-left fl">
			<div class="distribution">配送方式</div>
			<div class="express">快递运输</div>
			<div class="distribution-time">配送时间：<span>工作日、双休日与节假日均可送货</span></div>
		</div>
		<div class="goods_list-right fr">
			<div class="goods_list_detail clearfix">
				<img class="fl" src="{{$value.photourl}}">
				<div class="list_name fl">{{$value.name}}</div>
				<div class="list_money fl">{{$value.money}}</div>
				<div class="list_num fl">x{{$value.num}}</div>
				<input type="hidden" name="productId" value="{{$value.goodsId}}">
				<input type="hidden" name="buynum" value="{{$value.num}}">
			</div>
		</div>
	</div>
{{/each}}