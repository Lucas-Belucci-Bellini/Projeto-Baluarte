private _t0 = diag_tickTime;

private _fnc_sub = {
    private _s = _this;
    if (isNil "_s") exitWith { "" };
    if !(_s isEqualType "") exitWith { str _s };
    _s = _s regexReplace ["[|;:]", " "];
    _s = _s regexReplace ["[\r\n\t]+", " "];
    _s
};

private _fnc_pedacos = {
    params ["_marca", "_arma", "_slot", "_texto"];
    if (_texto == "") exitWith {};
    while { count _texto > 0 } do {
        private _p = _texto select [0, 640];
        diag_log text (format ["<<A3ACC>>%1|%2|%3|%4", _marca, _arma, _slot, _p]);
        _texto = _texto select [640];
    };
};

diag_log text "<<A3ACC>>INICIO|v1";

private _armas = "
    (getNumber (_x >> 'scope') >= 2) &&
    {(getNumber (_x >> 'type')) in [1, 2, 4]}
" configClasses (configFile >> "CfgWeapons");

private _nArmas = 0;
private _nPares = 0;

{
    private _cfg = _x;
    private _classe = configName _cfg;
    private _wsi = _cfg >> "WeaponSlotsInfo";
    private _nSlots = 0;

    {
        private _slot = (configName _x) call _fnc_sub;
        private _itens = [];
        {
            if (_x isEqualType "") then { _itens pushBack (_x call _fnc_sub) };
        } forEach (getArray (_x >> "compatibleItems"));

        if (count _itens > 0) then {
            ["S", _classe, _slot, _itens joinString ";"] call _fnc_pedacos;
            _nSlots = _nSlots + 1;
            _nPares = _nPares + count _itens;
        } else {
            diag_log text (format ["<<A3ACC>>SV|%1|%2", _classe, _slot]);
        };
    } forEach ("true" configClasses _wsi);

    diag_log text (format ["<<A3ACC>>N|%1|%2", _classe, _nSlots]);
    _nArmas = _nArmas + 1;
} forEach _armas;

private _dt = diag_tickTime - _t0;
diag_log text (format ["<<A3ACC>>FIM|%1|%2|%3", _nArmas, _nPares, _dt toFixed 1]);

private _msg = format ["DUMP ACESSORIOS OK em %1 s - %2 armas, %3 pares arma-acessorio. Rode: python scripts/arma3/parse-acessorios.py",
    _dt toFixed 1, _nArmas, _nPares];
hint _msg;
systemChat _msg;
copyToClipboard _msg;
_msg
