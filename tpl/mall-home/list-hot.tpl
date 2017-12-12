{{each}}
	<li class="sg fl" data-id="{{$value.id}}"><img src="{{$value.onePhoto}}"><span class="money">￥{{$value.price}}.00</span><span class="name">{{$value.name}}</span></li>
{{/each}}