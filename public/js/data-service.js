// public/js/data-service.js
// Live data service for Shenbury - connects to TRON blockchain

class ShenburyDataService {
    constructor() {
        this.tronWeb = null;
        this.contracts = {
            presale: null,
            token: null
        };
        this.cache = {
            presaleData: null,
            tokenPrice: null,
            lastUpdate: 0
        };
        this.CACHE_DURATION = 10000; // 10 seconds
    }

    // Initialize TronWeb connection
    async initialize() {
        // Wait for TronLink
        await this.waitForTronLink();
        
        if (window.tronWeb && window.tronWeb.ready) {
            this.tronWeb = window.tronWeb;
            
            // Initialize contracts
            await this.loadContracts();
            
            return true;
        }
        return false;
    }

    // Wait for TronLink to be ready
    async waitForTronLink() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.tronWeb && window.tronWeb.ready) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 5000);
        });
    }

    // Load contract instances
    async loadContracts() {
        try {
            // Contract addresses from environment or config
            const PRESALE_ADDRESS = window.PRESALE_CONTRACT || 'TVgSPg3KWq8dBhPMPQh4KQXkEPN3XfWtHg'; // Replace with actual
            const TOKEN_ADDRESS = window.TOKEN_CONTRACT || 'TXYZaBcDeFgHiJkLmNoPqRsTuVwXyZ1234'; // Replace with actual
            
            if (this.tronWeb) {
                // Load presale contract
                this.contracts.presale = await this.tronWeb.contract().at(PRESALE_ADDRESS);
                
                // Load token contract
                this.contracts.token = await this.tronWeb.contract().at(TOKEN_ADDRESS);
            }
        } catch (error) {
            console.error('Failed to load contracts:', error);
        }
    }

    // Get current TRX price in USD
    async getTRXPrice() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd');
            const data = await response.json();
            return data.tron.usd;
        } catch (error) {
            console.error('Failed to fetch TRX price:', error);
            return 0.14; // Fallback price
        }
    }

    // Get presale data from contract
    async getPresaleData() {
        // Check cache first
        if (this.cache.presaleData && Date.now() - this.cache.lastUpdate < this.CACHE_DURATION) {
            return this.cache.presaleData;
        }

        try {
            if (!this.contracts.presale) {
                // Return default data if contract not loaded
                return this.getDefaultPresaleData();
            }

            // Fetch data from contract
            const [
                currentStage,
                totalSold,
                presaleActive,
                startTime,
                endTime
            ] = await Promise.all([
                this.contracts.presale.currentStage().call(),
                this.contracts.presale.totalSold().call(),
                this.contracts.presale.presaleActive().call(),
                this.contracts.presale.startTime().call(),
                this.contracts.presale.endTime().call()
            ]);

            // Get current stage info
            const stageInfo = await this.contracts.presale.getCurrentStageInfo().call();

            const data = {
                currentStage: parseInt(currentStage),
                totalSold: this.tronWeb.toDecimal(totalSold) / 1e18,
                totalRaised: 0, // Calculate based on sales
                participants: 0, // Would need events or separate tracking
                presaleActive: presaleActive,
                startTime: parseInt(startTime) * 1000,
                endTime: parseInt(endTime) * 1000,
                currentPrice: this.tronWeb.toDecimal(stageInfo.price) / 1e6,
                availableTokens: this.tronWeb.toDecimal(stageInfo.available) / 1e18,
                stageBonus: parseInt(stageInfo.bonus)
            };

            // Cache the data
            this.cache.presaleData = data;
            this.cache.lastUpdate = Date.now();

            return data;
        } catch (error) {
            console.error('Failed to fetch presale data:', error);
            return this.getDefaultPresaleData();
        }
    }

    // Default presale data for when contract is not available
    getDefaultPresaleData() {
        return {
            currentStage: 0,
            totalSold: 0,
            totalRaised: 0,
            participants: 0,
            presaleActive: false,
            startTime: Date.now(),
            endTime: Date.now() + (14 * 24 * 60 * 60 * 1000),
            currentPrice: 0.10,
            availableTokens: 10000000,
            stageBonus: 30
        };
    }

    // Get artifact data (static for now, can be moved to IPFS)
    async getArtifactData() {
        // In production, this could fetch from IPFS or a decentralized storage
        return [
            {
                id: 1,
                lotNumber: '001',
                title: 'AN EXCEPTIONALLY RARE RU KILN SUNFLOWER-FORM WASHER',
                chinese: '北宋 汝官窯天青釉葵花洗',
                dynasty: 'song',
                dynastyInfo: 'Northern Song Dynasty, 1086-1106',
                reservePrice: 35000000, // $35M reserve
                estimateRange: '$35M - $55M',
                status: 'upcoming',
                auctionDate: 'Q1 2025',
                fractionalAvailable: true,
                description: 'One of fewer than 100 Ru ware pieces known to exist worldwide.',
                images: ['/assets/images/relics/001-song-ru-washer/main.jpg']
            },
            {
                id: 2,
                lotNumber: '002', 
                title: 'AN IMPERIAL RU KILN "SKY BLUE" BOTTLE',
                chinese: '北宋 汝窯天青釉瓶',
                dynasty: 'song',
                dynastyInfo: 'Northern Song Dynasty, 1086-1106',
                reservePrice: 40000000, // $40M reserve
                estimateRange: '$40M - $75M',
                status: 'upcoming',
                auctionDate: 'Q1 2025',
                fractionalAvailable: true,
                description: 'Exemplifies the restraint and elegance of the finest Ru ware.',
                images: ['/assets/images/relics/002-song-ru-bottle/main.jpg']
            },
            {
                id: 3,
                lotNumber: '003',
                title: 'A MAGNIFICENT MING XUANDE CLOISONNÉ TRIPOD CENSER',
                chinese: '明宣德 掐絲琺瑯獸鈕蓮紋三足爐',
                dynasty: 'ming',
                dynastyInfo: 'Xuande Period (1426-1435)',
                reservePrice: 12000000, // $12M reserve
                estimateRange: '$12M - $27M',
                status: 'upcoming',
                auctionDate: 'Q2 2025',
                fractionalAvailable: true,
                description: 'Golden age of Chinese cloisonné production.',
                images: ['/assets/images/relics/003-ming-cloisonne/main.jpg']
            },
            {
                id: 4,
                lotNumber: '004',
                title: 'AN EXTRAORDINARILY RARE YUAN JILAN-GLAZED EWER',
                chinese: '元 霽藍釉白龍紋梨形執壺',
                dynasty: 'yuan',
                dynastyInfo: 'Yuan Dynasty (1271-1368)',
                reservePrice: 12500000, // $12.5M reserve
                estimateRange: '$12.5M - $28M',
                status: 'upcoming',
                auctionDate: 'Q2 2025',
                fractionalAvailable: true,
                description: 'Spectacular ewer showcasing Yuan Dynasty mastery.',
                images: ['/assets/images/relics/004-yuan-jilan-ewer/main.jpg']
            },
            {
                id: 5,
                lotNumber: '005',
                title: 'IMPERIAL JINGTAI CLOISONNÉ LOTUS PATTERN LIDDED CASKET',
                chinese: '明景泰 掐絲琺瑯蓮紋蓋盒',
                dynasty: 'ming',
                dynastyInfo: 'Jingtai Period (1450-1457)',
                reservePrice: 8000000, // $8M reserve
                estimateRange: '$8M - $12M',
                status: 'upcoming',
                auctionDate: 'Q3 2025',
                fractionalAvailable: true,
                description: 'Masterpiece of Chinese decorative arts.',
                images: ['/assets/images/relics/005-ming-jingtai-casket/main.jpg']
            }
        ];
    }

    // Calculate token amount with bonus
    calculateTokenAmount(trxAmount, stageBonus = 0) {
        const currentPrice = 0.10; // Base price per SHEN
        const trxPrice = this.cache.tokenPrice || 0.14;
        const usdAmount = trxAmount * trxPrice;
        const baseTokens = usdAmount / currentPrice;
        const bonusTokens = baseTokens * (stageBonus / 100);
        return {
            baseTokens: Math.floor(baseTokens),
            bonusTokens: Math.floor(bonusTokens),
            totalTokens: Math.floor(baseTokens + bonusTokens),
            usdValue: usdAmount
        };
    }

    // Purchase tokens
    async purchaseTokens(trxAmount) {
        if (!this.contracts.presale) {
            throw new Error('Presale contract not loaded');
        }

        try {
            const result = await this.contracts.presale.purchaseTokens().send({
                callValue: this.tronWeb.toSun(trxAmount),
                feeLimit: 100_000_000
            });

            return {
                success: true,
                txId: result,
                amount: trxAmount
            };
        } catch (error) {
            console.error('Purchase failed:', error);
            throw error;
        }
    }

    // Get user's SHEN balance
    async getUserBalance(address) {
        if (!this.contracts.token || !address) {
            return 0;
        }

        try {
            const balance = await this.contracts.token.balanceOf(address).call();
            return this.tronWeb.toDecimal(balance) / 1e18;
        } catch (error) {
            console.error('Failed to get balance:', error);
            return 0;
        }
    }

    // Format numbers for display
    formatNumber(num, decimals = 2) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
}

// Create global instance
window.shenburyData = new ShenburyDataService();
