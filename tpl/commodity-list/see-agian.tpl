{{each}}
	<li data-id="{{$value.id}}">
		<img src="{{$value.onePhoto}}">
		<span class="see-money">￥{{$value.price}}.00</span>
	</li>
{{/each}}