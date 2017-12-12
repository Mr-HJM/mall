{{each}}
<div class="addresslist clearfix" data-id="{{$value.id}}">
	<div class="receiver-name fl">{{$value.receiver}}</div>
	<div class="address-detail fl">{{$value.content}}</div>
	<div class="phone-detail fl">{{$value.phone}}</div>
	<input type="hidden" class="tel-phone" value="{{$value.telephone}}">
	<input type="hidden" class="email" value="{{$value.email}}">
	{{if $value.isDefault == '1'}}
	<div class="default-address fl">默认地址</div>
	<div class="set-address fr">编辑</div>
	{{else}}
	<div class="delete-address fr">删除</div>
	<div class="set-address fr">编辑</div>
	<div class="set-default fr">设置默认地址</div>
	{{/if}}
</div>
{{/each}}