private _t0 = diag_tickTime;

private _fnc_lim = {
    private _s = _this;
    if (isNil "_s") exitWith { "" };
    if !(_s isEqualType "") exitWith { str _s };
    _s = _s regexReplace ["\\", "/"];
    _s = _s regexReplace ["""", "'"];
    _s = _s regexReplace ["\|", "/"];
    _s = _s regexReplace ["[\r\n\t]+", " "];
    _s
};

private _fnc_sub = {
    private _s = _this call _fnc_lim;
    _s = _s regexReplace ["[;:]", " "];
    _s
};

private _fnc_n = {
    if (isNumber _this) then { (getNumber _this) toFixed 4 } else { "" };
};

private _fnc_pedacos = {
    params ["_marca", "_classe", "_texto"];
    if (_texto == "") exitWith {};
    while { count _texto > 0 } do {
        private _p = _texto select [0, 660];
        diag_log text (format ["<<A3ANIM>>%1|%2|%3", _marca, _classe, _p]);
        _texto = _texto select [660];
    };
};

private _fnc_pares = {
    private _a = _this;
    private _saida = [];
    private _i = 0;
    while { _i < count _a } do {
        private _nome = _a select _i;
        private _peso = if (_i + 1 < count _a) then { str (_a select (_i + 1)) } else { "" };
        if (_nome isEqualType "") then {
            _saida pushBack format ["%1:%2", _nome call _fnc_sub, _peso];
        };
        _i = _i + 2;
    };
    _saida joinString ";"
};

diag_log text "<<A3ANIM>>INICIO|v1";

private _fnc_bloco = {
    params ["_marca", "_raiz"];
    private _n = 0;
    private _nT = 0;
    {
        private _cfg = _x;
        private _classe = configName _cfg;

        diag_log text (format ["<<A3ANIM>>%1|%2|%3|%4|%5|%6|%7|%8|%9|%10",
            _marca,
            _classe,
            (getText (_cfg >> "file")) call _fnc_lim,
            (_cfg >> "speed") call _fnc_n,
            (_cfg >> "looped") call _fnc_n,
            (_cfg >> "terminal") call _fnc_n,
            (_cfg >> "disableWeapons") call _fnc_n,
            (_cfg >> "enableOptics") call _fnc_n,
            (_cfg >> "canPullTrigger") call _fnc_n,
            (getText (_cfg >> "actions")) call _fnc_lim
        ]);

        private _con = getArray (_cfg >> "connectTo");
        [_marca + "C", _classe, _con call _fnc_pares] call _fnc_pedacos;
        [_marca + "I", _classe, (getArray (_cfg >> "interpolateTo")) call _fnc_pares] call _fnc_pedacos;

        _n = _n + 1;
        _nT = _nT + (floor ((count _con) / 2));
    } forEach ("true" configClasses _raiz);
    [_n, _nT]
};

private _mov = ["A", configFile >> "CfgMovesMaleSdr" >> "States"] call _fnc_bloco;
private _ges = ["G", configFile >> "CfgGesturesMale" >> "States"] call _fnc_bloco;

private _dt = diag_tickTime - _t0;
diag_log text (format ["<<A3ANIM>>FIM|%1|%2|%3|%4",
    _mov select 0, _ges select 0, (_mov select 1) + (_ges select 1), _dt toFixed 1]);

private _msg = format ["DUMP ANIMACOES OK em %1 s - %2 estados, %3 gestos, %4 transicoes. Rode: python scripts/arma3/parse-animacoes.py",
    _dt toFixed 1, _mov select 0, _ges select 0, (_mov select 1) + (_ges select 1)];
hint _msg;
systemChat _msg;
copyToClipboard _msg;
_msg
