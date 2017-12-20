{{each}}
	<li data-id="{{$value.id}}">
		<img src="{{$value.onePhoto}}">
		<span class="see-money"><span>价格：</span>￥{{$value.price}}.00</span>
	</li>
{{/each}}