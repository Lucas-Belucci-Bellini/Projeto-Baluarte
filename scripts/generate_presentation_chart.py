from pathlib import Path
import matplotlib.pyplot as plt

out = Path('/home/ubuntu/Projeto-Baluarte-ts/docs/presentations')
out.mkdir(parents=True, exist_ok=True)
plt.rcParams.update({'font.family': 'DejaVu Sans', 'text.color': '#d7e7ff', 'axes.labelcolor': '#9fb4d0', 'xtick.color': '#9fb4d0', 'ytick.color': '#9fb4d0'})
fig, ax = plt.subplots(figsize=(10, 5.2), dpi=180)
fig.patch.set_facecolor('#07111f')
ax.set_facecolor('#07111f')
labels = ['Páginas\nTypeScript', 'Páginas\nJS canônicas', 'Testes\npassando', 'Rotas\nsmoke']
values = [31, 83, 884, 98]
colors = ['#21d4c4', '#426487', '#a9e66b', '#57a8ff']
bars = ax.bar(labels, values, color=colors, width=0.58)
ax.set_title('Estado verificável do marco a805ff8b', loc='left', color='#ffffff', fontsize=15, fontweight='bold', pad=18)
ax.set_ylim(0, 950)
ax.grid(axis='y', color='#1a314a', linewidth=0.8, alpha=0.9)
ax.set_axisbelow(True)
for bar, value in zip(bars, values):
    ax.text(bar.get_x() + bar.get_width()/2, value + (18 if value < 200 else 24), str(value), ha='center', va='bottom', color='#ffffff', fontsize=13, fontweight='bold')
ax.spines[['top', 'right', 'left']].set_visible(False)
ax.spines['bottom'].set_color('#294866')
ax.tick_params(axis='y', length=0)
fig.tight_layout()
fig.savefig(out / 'progress_chart.png', facecolor=fig.get_facecolor(), bbox_inches='tight')
plt.close(fig)
