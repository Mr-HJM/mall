{{each}}
    {{if $value.isShow}}
        <li class="navAct {{$value.id}}">{{$value.menuName}}</li>
    {{else}}
        <li class="{{$value.id}}">{{$value.menuName}}</li>
    {{/if}}
{{/each}}