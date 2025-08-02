document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleSidebarBtn');
    const sidebar = document.getElementById('sidebar');
    // toggleIcon não é mais necessário se o botão sempre tiver a logo
    const bannerImg = document.getElementById('banner-img');
    const menuLinks = document.querySelectorAll('.menu ul li a');
    const mainContent = document.getElementById('mainContent');

    // Função centralizada para atualizar atributos ARIA e VISIBILIDADE DO BOTÃO
    const atualizarSidebarUI = () => {
        if (!sidebar || !toggleBtn) return; // Removido toggleIcon da verificação

        const isCollapsed = sidebar.classList.contains('collapsed');

        if (isCollapsed) {
            // Estado: Recolhido - Esconde o botão
            toggleBtn.style.display = 'none';
            toggleBtn.setAttribute('aria-label', 'Mostrar menu lateral');
            toggleBtn.setAttribute('title', 'Mostrar menu lateral');
        } else {
            // Estado: Expandido - Mostra o botão
            toggleBtn.style.display = 'flex';
            toggleBtn.setAttribute('aria-label', 'Esconder menu lateral');
            toggleBtn.setAttribute('title', 'Esconder menu lateral');
        }
    };

    const atualizarBannerDoDia = () => {
        if (!bannerImg) return;
        const hoje = new Date().getDay();
        const dias = {
            0: 'domingo.jpg', 1: 'segunda.jpg', 2: 'terca.jpg',
            3: 'quarta.jpg', 4: 'quinta.jpg', 5: 'sexta.jpg', 6: 'sabado.jpg'
        };
        const imagemDoDia = dias[hoje];
        
        if (imagemDoDia) {
            const nomeDia = imagemDoDia.split('.')[0];
            bannerImg.src = `./banners/${imagemDoDia}`;
            bannerImg.alt = `Banner especial de ${nomeDia.charAt(0).toUpperCase() + nomeDia.slice(1)}`;
            bannerImg.style.display = "block";
        } else {
            bannerImg.style.display = "none";
        }
    };

    // --- EVENT LISTENERS ---

    // O botão de toggle AGORA SÓ FECHA a sidebar (quando visível)
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (!sidebar.classList.contains('collapsed')) { // Se não estiver recolhida (ou seja, está expandida)
                sidebar.classList.add('collapsed'); // Recolhe a sidebar
            } else { // Se estiver recolhida (clicou para abrir)
                sidebar.classList.remove('collapsed'); // Expande a sidebar
            }
            atualizarSidebarUI(); // Sempre atualiza a UI após a mudança
        });
    }

    // Ouvinte de eventos para a própria barra lateral para expandir ao clicar nela
    if (sidebar) {
        sidebar.addEventListener('click', (event) => {
            // Verifica se a barra lateral está recolhida E o clique NÃO é no próprio botão de alternância
            if (sidebar.classList.contains('collapsed') && event.target !== toggleBtn && !toggleBtn.contains(event.target)) {
                sidebar.classList.remove('collapsed'); // Expande a barra lateral
                atualizarSidebarUI(); // Atualiza a UI
            }
        });
    }

    // Ouvinte de eventos para a área de conteúdo principal para recolher a barra lateral quando expandida e clicada fora (apenas no mobile)
    if (mainContent) {
        mainContent.addEventListener('click', () => {
            const isMobile = window.innerWidth <= 640;
            if (!sidebar.classList.contains('collapsed') && isMobile) {
                sidebar.classList.add('collapsed');
                atualizarSidebarUI();
            }
        });
    }

    // Adiciona um ouvinte de eventos a cada link do menu
    menuLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // Se a sidebar estiver recolhida, impede o comportamento padrão do link
            if (sidebar.classList.contains('collapsed')) {
                event.preventDefault(); // Impede a navegação
                sidebar.classList.remove('collapsed'); // Expande a sidebar
                atualizarSidebarUI(); // Atualiza a UI
            }
            // Se a sidebar não estiver recolhida, o link funcionará normalmente
        });
    });

    // Lida com o recolhimento/expansão da barra lateral na carga inicial e redimensionamento
    window.addEventListener('resize', () => {
        const isMobile = window.innerWidth <= 640;
        if (isMobile) {
            sidebar.classList.add('collapsed'); // Sempre recolhida por padrão no mobile
        } else {
            sidebar.classList.remove('collapsed'); // Sempre expandida por padrão no desktop
        }
        atualizarSidebarUI(); // Atualiza visibilidade do botão e atributos ARIA
    });


    // --- INICIALIZAÇÃO ---

    // Adiciona a classe 'collapsed' se for mobile na carga inicial
    if (window.innerWidth <= 640) {
        sidebar.classList.add('collapsed');
    }
    
    atualizarSidebarUI(); // Chama a função para definir os atributos corretos no carregamento
    atualizarBannerDoDia(); // Carrega o banner do dia
});