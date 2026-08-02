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

private _fnc_flag = { if (isNumber _this) then { getNumber _this } else { -1 } };

diag_log text "<<A3FUNC>>INICIO|v1";

private _nTags = 0;
private _nFuncs = 0;

{
    private _cfgTag = _x;
    private _tag = configName _cfgTag;
    _nTags = _nTags + 1;

    diag_log text (format ["<<A3FUNC>>T|%1|%2|%3",
        _tag,
        [getText (_cfgTag >> "tag")] call _fnc_lim,
        [getText (_cfgTag >> "file")] call _fnc_lim]);

    {
        private _cfgCat = _x;
        private _categoria = configName _cfgCat;
        private _dirCat = [getText (_cfgCat >> "file")] call _fnc_lim;

        {
            private _cfgF = _x;
            private _nome = configName _cfgF;

            private _arquivo = [getText (_cfgF >> "file")] call _fnc_lim;
            if (_arquivo == "" && _dirCat != "") then {
                _arquivo = format ["%1/fn_%2.sqf", _dirCat, _nome];
            };

            diag_log text (format ["<<A3FUNC>>F|%1|%2|%3|%4|%5|%6|%7|%8",
                _tag, _categoria, _nome, _arquivo,
                [getText (_cfgF >> "ext")] call _fnc_lim,
                (_cfgF >> "preInit") call _fnc_flag,
                (_cfgF >> "postInit") call _fnc_flag,
                (_cfgF >> "recompile") call _fnc_flag]);
            _nFuncs = _nFuncs + 1;
        } forEach ("true" configClasses _cfgCat);
    } forEach ("true" configClasses _cfgTag);
} forEach ("true" configClasses (configFile >> "CfgFunctions"));

diag_log text (format ["<<A3FUNC>>PLACAR|%1|%2", _nTags, _nFuncs]);
diag_log text (format ["<<A3FUNC>>FIM|%1", (diag_tickTime - _t0) toFixed 2]);

hint format ["Dump de funcoes pronto.\n%1 tags . %2 funcoes\n%3 s\n\nRode: python scripts/arma3/parse-funcoes.py",
    _nTags, _nFuncs, (diag_tickTime - _t0) toFixed 1];
