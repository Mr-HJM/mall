{{each}}
<ul class="ul-nav" data-id="{{$value.id}}">
	<div class="ulNav-title">{{$value.name}}</div>
	{{each $value.child}}<li data-id="{{$value.id}}">{{$value.name}}</li>{{/each}}
</ul>
{{/each}}