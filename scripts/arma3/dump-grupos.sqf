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

private _fnc_pedacos = {
    params ["_marca", "_id", "_texto"];
    while { count _texto > 0 } do {
        private _p = _texto select [0, 700];
        diag_log text (format ["<<A3GRUPO>>%1|%2|%3", _marca, _id, _p]);
        _texto = _texto select [700];
    };
};

diag_log text "<<A3GRUPO>>INICIO|v1";

private _nLados = 0;
private _nGrupos = 0;
private _nUnidades = 0;

{
    private _cfgLado = _x;
    private _lado = configName _cfgLado;
    _nLados = _nLados + 1;

    {
        private _cfgFac = _x;
        private _faccao = configName _cfgFac;
        private _nomeFac = [getText (_cfgFac >> "name")] call _fnc_lim;
        diag_log text (format ["<<A3GRUPO>>F|%1|%2|%3", _lado, _faccao, _nomeFac]);

        {
            private _cfgCat = _x;
            private _categoria = configName _cfgCat;
            private _nomeCat = [getText (_cfgCat >> "name")] call _fnc_lim;
            diag_log text (format ["<<A3GRUPO>>C|%1|%2|%3|%4", _lado, _faccao, _categoria, _nomeCat]);

            {
                private _cfgGrp = _x;
                private _classe = configName _cfgGrp;
                private _id = format ["%1/%2/%3/%4", _lado, _faccao, _categoria, _classe];
                private _nome = [getText (_cfgGrp >> "name")] call _fnc_lim;

                diag_log text (format ["<<A3GRUPO>>G|%1|%2|%3|%4|%5|%6",
                    _id, _lado, _faccao, _categoria, _classe, _nome]);

                private _unidades = [];
                {
                    private _u = _x;
                    private _tipo = [getText (_u >> "vehicle")] call _fnc_lim;
                    if (_tipo != "") then {
                        private _cfgV = configFile >> "CfgVehicles" >> _tipo;
                        _unidades pushBack [
                            configName _u,
                            _tipo,
                            [if (isClass _cfgV) then { getText (_cfgV >> "displayName") } else { "" }] call _fnc_lim,
                            [getText (_u >> "rank")] call _fnc_lim,
                            if (isNumber (_u >> "position")) then { getNumber (_u >> "position") } else { -1 }
                        ];
                        _nUnidades = _nUnidades + 1;
                    };
                } forEach ("true" configClasses _cfgGrp);

                ["GU", _id, [str _unidades] call _fnc_lim] call _fnc_pedacos;
                _nGrupos = _nGrupos + 1;
            } forEach ("true" configClasses _cfgCat);
        } forEach ("true" configClasses _cfgFac);
    } forEach ("true" configClasses _cfgLado);
} forEach ("true" configClasses (configFile >> "CfgGroups"));

diag_log text (format ["<<A3GRUPO>>PLACAR|%1|%2|%3", _nLados, _nGrupos, _nUnidades]);
diag_log text (format ["<<A3GRUPO>>FIM|%1", (diag_tickTime - _t0) toFixed 2]);

hint format ["Dump de grupos pronto.\n%1 lados . %2 grupos . %3 unidades\n%4 s\n\nRode: python scripts/arma3/parse-grupos.py",
    _nLados, _nGrupos, _nUnidades, (diag_tickTime - _t0) toFixed 1];
