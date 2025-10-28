// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- AMENIDADES, CATEGORÍAS, OCUPACIONES, MÉTODOS PAGO, SERVICIOS ---
  // ASUMIMOS QUE ESTOS YA FUERON CARGADOS
  console.log('Verificando datos base existentes...');

  // --- ¡SOLO SEED PARA TIPOS DE HABITACIÓN EJECUTIVA! ---
  console.log('\nSeeding Tipos de Habitación (SOLO EJECUTIVA)...');

  const categoriasDB = await prisma.categoria.findMany({ select: { id: true, nombre: true } });
  const ocupacionesDB = await prisma.ocupacion.findMany({ select: { id: true, nombre: true } });
  const todasAmenidadesDB = await prisma.amenidad.findMany({ select: { id: true, nombre: true } }); // Para buscar IDs

  // Funciones helper (simplificadas)
  const findIdByName = (list, name) => list.find(item => item.nombre.toLowerCase() === name.toLowerCase())?.id;
  const findAmenidadIdsByNames = (names) => {
    const lowerCaseNames = names.map(n => n.toLowerCase());
    return todasAmenidadesDB
      .filter(am => lowerCaseNames.includes(am.nombre.toLowerCase()))
      .map(am => am.id);
  };

  // Tus datos mock (FILTRADOS solo para Ejecutiva)
  const habitacionesMockEjecutiva = [
    {
      _id: "J_1", name: "Retiro Ejecutivo",
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/ejecutivo/individual/individual_ejecutivo_1.png", // <- REEMPLAZAR
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/ejecutivo/individual/individual_ejecutivo_2.png", // <- REEMPLAZAR
      price: 210000, description: "El balance perfecto entre negocios y bienestar. Esta habitación ejecutiva ofrece un sofisticado espacio de trabajo totalmente equipado frente a un ventanal panorámico con vistas a la montaña. Un refugio de lujo diseñado para inspirar productividad y garantizar el máximo confort.", huespedes: 1, category: "Ejecutiva",
      ocupacionNombreExacto: "Individual" // Coincide con tu tabla Ocupacion
    },
    {
      _id: "J_2", name: "Relax Ejecutiva",
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/ejecutivo/dobleQueen/dobleQueen_ejecutivo_1.png", // <- REEMPLAZAR
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/ejecutivo/dobleQueen/dobleQueen_ejecutivo_2.png", // <- REEMPLAZAR
      price: 240000, description: "Diseñada para la máxima eficiencia, esta suite ofrece un lujoso dormitorio con baño tipo spa y una oficina privada con doble estación de trabajo. Es el entorno ideal para equipos o parejas que buscan un espacio de alto rendimiento con el máximo confort y vistas inspiradoras.", huespedes: 2, category: "Ejecutiva",
      ocupacionNombreExacto: "Doble Queen" // Coincide con tu tabla Ocupacion
    },
  ];

  // --- ¡NUEVO CÓDIGO PARA TIPOS DE HABITACIÓN ESTÁNDAR! ---
  console.log('\nSeeding Tipos de Habitación (ESTÁNDAR)...');

  // ⬇️⬇️ 1. PEGA ESTE ARRAY NUEVO ⬇️⬇️
  // ⬇️⬇️ ¡¡¡REEMPLAZA LAS URLS PLACEHOLDER POR LAS REALES DE SUPABASE!!! ⬇️⬇️
  const habitacionesMockEstandar = [
    { _id: "E_1", name: "Estancia Mirador", 
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/individual/individual_estandar_1.jpg", 
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/individual/individual_estandar_2.jpg", 
      price: 55000, description: "Un refugio íntimo bañado en luz natural. Despierta con inspiradoras vistas al paisaje desde su gran ventanal. Con un diseño moderno y un práctico baño integrado, es el espacio ideal para tu confort y descanso.", 
      huespedes: 1, category: "Estándar", ocupacionNombreExacto: "Individual" },
    { _id: "E_2", name: "Remanso Queen", 
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/dobleQueen/dobleQueen_estandar_1.jpg", 
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/dobleQueen/dobleQueen_estandar_2.jpg", 
      price: 78000, description: "Un espacio superior donde la elegancia y el confort se encuentran. Diseñada para un descanso profundo, esta habitación cuenta con una amplia cama Queen y una decoración sofisticada que combina maderas nobles y tonos serenos. El baño, sutilmente integrado y equipado con una bañera de inmersión, promete una relajación absoluta.", 
      huespedes: 2, category: "Estándar", ocupacionNombreExacto: "Doble Queen" },
    { _id: "E_3", name: "Estancia Armonía", 
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/tripleQueen/tripleQueen_estandar_1.jpg", 
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/tripleQueen/tripleQueen_estandar_2.jpg", 
      price: 82000, description: "Ideal para compartir, esta espaciosa habitación combina un diseño clásico y acogedor con la comodidad de dos camas impecables. Bañada en luz natural, su atmósfera serena es perfecta para familias o amigos que buscan descansar en un entorno de total confort.", 
      huespedes: 3, category: "Estándar", ocupacionNombreExacto: "Triple Queen" },
    { _id: "E_4", name: "Refugio Familiar", 
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/cuadrupleTwin/cuadrupleTwin_estandar_1.jpg", 
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/cuadrupleTwin/cuadrupleTwin_estandar_2.jpg", 
      price: 95000, description: "Nuestra habitación más espaciosa, diseñada para el confort de familias o grupos. Combina una elegante decoración en tonos serenos con mobiliario de madera noble. Disfrute de sus vistas a la naturaleza, creando el refugio perfecto para una estancia memorable.", 
      huespedes: 4, category: "Estándar", ocupacionNombreExacto: "Cuádruple Queen" },
    { _id: "E_5", name: "Estancia Dúo", 
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/dobleTwin/dobleTwin_estandar_1.jpg", 
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/dobleTwin/dobleTwin_estandar_2.jpg", 
      price: 75000, description: "Perfecta para amigos o colegas, esta habitación ofrece el confort de dos camas individuales en un ambiente de sofisticada serenidad. Su elegante decoración y la abundante luz natural crean un espacio distinguido y acogedor para un descanso reparador.", 
      huespedes: 2, category: "Estándar", ocupacionNombreExacto: "Doble Twin" },
    { _id: "E_6", name: "Estancia Trío", 
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/tripleTwin/tripleTwin_estandar_1.jpg", 
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/tripleTwin/tripleTwin_estandar_2.jpg", 
      price: 85000, description: "Diseñada para la comodidad de pequeños grupos o familias, esta habitación ofrece una versátil configuración de camas en un ambiente elegante. Los tonos azules y la cuidada decoración crean un refugio de paz y confort para una estancia inolvidable.", 
      huespedes: 3, category: "Estándar", ocupacionNombreExacto: "Triple Twin" },
    { _id: "E_7", name: "Santuario Familiar", 
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/cuadrupleTwin/cuadrupleTwin_estandar_1.jpg", 
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/estandar/cuadrupleTwin/cuadrupleTwin_estandar_2.jpg", 
      price: 98000, description: "Ideal para familias o grupos, esta amplia habitación combina diseño contemporáneo y confort. Equipada con dos camas y un balcón privado con vistas, es el santuario perfecto para una estancia espaciosa y relajante.", 
      huespedes: 4, category: "Estándar", ocupacionNombreExacto: "Cuádruple Twin" },
  ];

  // --- ¡NUEVO CÓDIGO PARA TIPOS DE HABITACIÓN DELUXE! ---
  console.log('\nSeeding Tipos de Habitación (DELUXE)...');

  const habitacionesMockDeluxe = [
    { _id: "D_1", name: "Retiro de Montaña", 
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/deluxe/individual/individual_deluxe_1.png", 
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/deluxe/individual/individual_deluxe_2.png", 
      price: 110000, description: "Un espacio exclusivo diseñado para la contemplación y el máximo confort. Disfrute de una vista panorámica inigualable a las montañas desde su ventanal de piso a techo, complementado por un suntuoso baño tipo spa con bañera y ducha independiente para una relajación total.", 
      huespedes: 1, category: "Deluxe", ocupacionNombreExacto: "Individual" },
    { _id: "D_2", name: "Panorámica Fronalpstock", 
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/deluxe/dobleQueen/dobleQueen_deluxe_1.jpeg", 
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/deluxe/dobleQueen/dobleQueen_deluxe_2.jpeg", 
      price: 135000, description: "Un lugar de lujo donde el diseño y la naturaleza convergen. Despierte frente a un balcón privado con vistas panorámicas a la montaña. Este espacio superior cuenta con una suntuosa cama Queen y una zona de trabajo independiente, creando un balance perfecto entre descanso y productividad.", 
      huespedes: 2, category: "Deluxe", ocupacionNombreExacto: "Doble Queen" },
    { _id: "D_3", name: "Mirador del Rey", 
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/deluxe/tripleQueen/tripleQueen_deluxe_1.png", 
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/deluxe/tripleQueen/tripleQueen_deluxe_2.png", 
      price: 155000, description: "Diseñada para el confort superior de familias, esta suite cuenta con una cama Queen y una individual. Su magnífico balcón privado ofrece una conexión directa con el imponente paisaje montañoso, garantizando una estancia de lujo, espacio y serenidad inolvidables.", 
      huespedes: 3, category: "Deluxe", ocupacionNombreExacto: "Triple Queen" },
    { _id: "D_4", name: "Gran Mirador Familiar", 
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/deluxe/cuadrupleQueen/cuadrupleQueen_deluxe_1.png", 
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/deluxe/cuadrupleQueen/cuadrupleQueen_deluxe_2.png", 
      price: 175000, description: "La habitación ideal para familias que buscan un plus de confort y espacio. Equipada con dos amplias camas Queen y un balcón privado, ofrece vistas espectaculares y un ambiente de lujo sereno para garantizar una estancia memorable para todos.", 
      huespedes: 4, category: "Deluxe", ocupacionNombreExacto: "Cuádruple Queen" },
    { _id: "D_5", name: "Mirador Gemelo", 
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/deluxe/dobleTwin/dobleTwin_deluxe_1.png", 
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/deluxe/dobleTwin/dobleTwin_deluxe_2.png", 
      price: 145000, description: "Experimente el lujo compartido en un espacio de diseño excepcional. Esta habitación cuenta con dos camas individuales frente a un ventanal panorámico con balcón privado y vistas espectaculares a la sierra. Incluye una elegante zona de estar, garantizando una estancia de confort superior.", 
      huespedes: 2, category: "Deluxe", ocupacionNombreExacto: "Doble Twin" },
    { _id: "D_6", name: "Mirador Trío", 
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/deluxe/tripleTwin/tripleTwin_deluxe_1.png", 
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/deluxe/tripleTwin/tripleTwin_deluxe_2.png", 
      price: 160000, description: "Un refugio de lujo para grupos, equipado con tres cómodas camas individuales. Su balcón privado se abre a un paisaje montañoso imponente, ofreciendo un espacio de serenidad y vistas inmejorables para una experiencia de confort elevado y compartido.", 
      huespedes: 3, category: "Deluxe", ocupacionNombreExacto: "Triple Twin" },
    { _id: "D_7", name: "Gran Mirador", 
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/deluxe/cuadrupleTwin/cuadrupleTwin_deluxe_1.png", 
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/deluxe/cuadrupleTwin/cuadrupleTwin_deluxe_2.png", 
      price: 180000, description: "La máxima expresión de lujo para familias. Esta amplia habitación cuenta con cuatro camas, una sala de estar y un balcón privado con vistas inigualables a la cordillera. Un santuario de confort y diseño para crear recuerdos memorables.", 
      huespedes: 4, category: "Deluxe", ocupacionNombreExacto: "Cuádruple Twin" },
  ];

  // ⬇️⬇️ 1. ESTE ES EL ARRAY NUEVO ⬇️⬇️
  // ⬇️⬇️ ¡¡¡REEMPLAZA LAS URLS PLACEHOLDER POR LAS REALES DE SUPABASE!!! ⬇️⬇️
  const habitacionesMockSuite = [
    { _id: "S_1", name: "Suite Cumbre",
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/suite/dobleQueen/dobleQueen_suite_1.png", // <- REEMPLAZAR
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/suite/dobleQueen/dobleQueen_suite_2.png", // <- REEMPLAZAR
      price: 350000, description: "La joya de nuestro hotel. Una experiencia de lujo sin igual con una espaciosa sala de estar, chimenea y un jacuzzi privado frente a un ventanal panorámico. Diseñada para ofrecer un confort supremo y vistas inolvidables, es nuestro máximo santuario de exclusividad y relajación.", 
      huespedes: 2, category: "Suite",
      ocupacionNombreExacto: "Doble Queen" // Asumiendo Doble Queen para Cumbre
    },
    { _id: "S_2", name: "Suite Legado",
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/suite/familiar/familiar_suite_1.png", // <- REEMPLAZAR
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/suite/familiar/familiar_suite_2.png", // <- REEMPLAZAR
      price: 480000, description: "Nuestro apartamento más exclusivo, diseñado para familias. Esta suite ofrece dos camas Queen, una cocina gourmet completa y un comedor con vistas panorámicas a la cordillera. Es el espacio definitivo para crear recuerdos inolvidables con el máximo confort, lujo y privacidad.", 
      huespedes: 4, category: "Suite",
      ocupacionNombreExacto: "Suite Familiar" // Usa la nueva ocupación que creaste
    },
    { _id: "S_3", name: "Suite Nupcial",
      image1: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/suite/pareja/parejaRomantico_suite_1.png", // <- REEMPLAZAR
      image2: "https://klpazvpvopqdenlzavdj.supabase.co/storage/v1/object/public/imagenes-habitaciones/suite/pareja/parejaRomantico_suite_2.png", // <- REEMPLAZAR
      price: 390000, description: "El escenario perfecto para el romance. Nuestra suite más íntima, diseñada para parejas, ofrece un balcón privado para admirar el atardecer y un jacuzzi con vistas panorámicas a las montañas. Un refugio de lujo y pasión para crear momentos inolvidables.", 
      huespedes: 2, category: "Suite",
      ocupacionNombreExacto: "Suite Pareja" // Usa la nueva ocupación que creaste
    },
  ];

  for (const data of habitacionesMockEjecutiva) {
      const categoriaId = findIdByName(categoriasDB, data.category);
      const ocupacionId = findIdByName(ocupacionesDB, data.ocupacionNombreExacto);

      if (!categoriaId || !ocupacionId) {
        console.warn(`  -> WARN: No se encontró Categoría ('${data.category}') u Ocupación ('${data.ocupacionNombreExacto}') para '${data.name}'. Saltando... Revisa los nombres.`);
        continue;
      }

      // Define qué amenidades incluye la categoría Ejecutiva (AHORA CON LAS NUEVAS)
      // (Asegúrate que estos nombres existan en tu tabla Amenidad)
      let amenidadesNombres = [
          'Baño privado con ducha', 'TV LCD de 30" a 43" con cable',
          'Wi-Fi de Alta Velocidad', // Usando la versión mejorada
          'Aire Acondicionado SPLIT', 'Frigobar', 'Calefacción Central',
          'Secador de Pelo', 'Teléfono DDI - DDN',
          'Cerradura con tarjeta de proximidad', 'Caja Individual de Seguridad Digital',
          'Escritorio de Trabajo', // Amenidad nueva
          'Silla Ergonómica',    // Amenidad nueva
          'Cafetera Nespresso',   // Amenidad nueva
        ];
      const amenidadesIds = findAmenidadIdsByNames(amenidadesNombres);
       if (amenidadesIds.length !== amenidadesNombres.length) {
         console.warn(`  -> WARN: No se encontraron todas las amenidades para '${data.name}'. Verifica los nombres en la lista 'amenidadesNombres'.`)
       }

      // Construye el array de imágenes con las URLs
      const imagenesData = [];
      if (data.image1 && data.image1.startsWith('http')) imagenesData.push({ url: data.image1 });
      if (data.image2 && data.image2.startsWith('http')) imagenesData.push({ url: data.image2 });

      try {
          const tipoHabitacion = await prisma.tipoHabitacion.upsert({
            where: { categoriaId_ocupacionId_nombre: { categoriaId, ocupacionId, nombre: data.name } },
            update: {
              descripcion: data.description,
              tarifaBase: data.price,
            },
            create: {
              nombre: data.name,
              descripcion: data.description,
              tarifaBase: data.price,
              categoria: { connect: { id: categoriaId } },
              ocupacion: { connect: { id: ocupacionId } },
              imagenes: { create: imagenesData },
              amenidades: {
                create: amenidadesIds.map(id => ({
                  amenidad: { connect: { id: id } }
                }))
              }
            },
            include: { categoria: true, ocupacion: true },
          });
          console.log(`  -> Creado/Verificado TipoHabitacion: ${tipoHabitacion.nombre} (Cat: ${tipoHabitacion.categoria.nombre}, Ocu: ${tipoHabitacion.ocupacion.nombre})`);
      } catch (error) {
           console.error(`  -> ERROR creando/actualizando TipoHabitacion '${data.name}':`, error.message);
      }
  }
  // --- FIN DEL CÓDIGO PARA TIPOS DE HABITACIÓN ---

  // ⬇️⬇️ 2. PEGA ESTE LOOP NUEVO ⬇️⬇️
  for (const data of habitacionesMockEstandar) {
      const categoriaId = findIdByName(categoriasDB, data.category);
      const ocupacionId = findIdByName(ocupacionesDB, data.ocupacionNombreExacto);

      if (!categoriaId || !ocupacionId) {
        console.warn(`  -> WARN: No se encontró Categoría ('${data.category}') u Ocupación ('${data.ocupacionNombreExacto}') para '${data.name}'. Saltando...`);
        continue;
      }

      // Define qué amenidades incluye la categoría Estándar (¡AJUSTA ESTO!)
      let amenidadesNombres = [
          'Baño privado con ducha',
          'TV LCD de 30" a 43" con cable',
          'Acceso a Internet Wi-Fi limitado', // O la versión de alta velocidad si aplica
          'Calefacción Central',
          'Cerradura con tarjeta de proximidad',
          // Podrías quitar/añadir según tu definición de Estándar
        ];
      const amenidadesIds = findAmenidadIdsByNames(amenidadesNombres);
      if (amenidadesIds.length !== amenidadesNombres.length) {
         console.warn(`  -> WARN: No se encontraron todas las amenidades para '${data.name}'. Verifica los nombres en la lista 'amenidadesNombres'.`)
       }

      // Construye el array de imágenes con las URLs
      const imagenesData = [];
      if (data.image1 && data.image1.startsWith('http')) imagenesData.push({ url: data.image1 });
      if (data.image2 && data.image2.startsWith('http')) imagenesData.push({ url: data.image2 });

      try {
          const tipoHabitacion = await prisma.tipoHabitacion.upsert({
            where: { categoriaId_ocupacionId_nombre: { categoriaId, ocupacionId, nombre: data.name } },
            update: {
              descripcion: data.description,
              tarifaBase: data.price,
            },
            create: {
              nombre: data.name,
              descripcion: data.description,
              tarifaBase: data.price,
              categoria: { connect: { id: categoriaId } },
              ocupacion: { connect: { id: ocupacionId } },
              imagenes: { create: imagenesData },
              amenidades: {
                create: amenidadesIds.map(id => ({
                  amenidad: { connect: { id: id } }
                }))
              }
            },
            include: { categoria: true, ocupacion: true },
          });
          console.log(`  -> Creado/Verificado TipoHabitacion: ${tipoHabitacion.nombre} (Cat: ${tipoHabitacion.categoria.nombre}, Ocu: ${tipoHabitacion.ocupacion.nombre})`);
      } catch (error) {
           console.error(`  -> ERROR creando/actualizando TipoHabitacion '${data.name}':`, error.message);
      }
  }
  // --- FIN DEL CÓDIGO PARA ESTÁNDAR ---

  // ⬇️⬇️ 2. PEGA ESTE LOOP NUEVO ⬇️⬇️
  for (const data of habitacionesMockDeluxe) {
      const categoriaId = findIdByName(categoriasDB, data.category);
      const ocupacionId = findIdByName(ocupacionesDB, data.ocupacionNombreExacto);

      if (!categoriaId || !ocupacionId) {
        console.warn(`  -> WARN: No se encontró Categoría ('${data.category}') u Ocupación ('${data.ocupacionNombreExacto}') para '${data.name}'. Saltando...`);
        continue;
      }

      // Define qué amenidades incluye la categoría Deluxe (¡AJUSTA ESTO!)
      let amenidadesNombres = [
          'Baño privado con ducha', 'TV LCD de 30" a 43" con cable',
          'Acceso a Internet Wi-Fi limitado', // O la versión de alta velocidad
          'Aire Acondicionado SPLIT', 'Frigobar', 'Calefacción Central',
          'Secador de Pelo', 'Teléfono DDI - DDN',
          'Cerradura con tarjeta de proximidad',
          // Puedes añadir 'Caja Individual de Seguridad Digital' si la incluye Deluxe
          // Puedes añadir 'Escritorio de Trabajo' si la incluye Deluxe
        ];
      const amenidadesIds = findAmenidadIdsByNames(amenidadesNombres);
      if (amenidadesIds.length !== amenidadesNombres.length) {
         console.warn(`  -> WARN: No se encontraron todas las amenidades para '${data.name}'. Verifica los nombres en la lista 'amenidadesNombres'.`)
       }

      // Construye el array de imágenes con las URLs
      const imagenesData = [];
      if (data.image1 && data.image1.startsWith('http')) imagenesData.push({ url: data.image1 });
      if (data.image2 && data.image2.startsWith('http')) imagenesData.push({ url: data.image2 });

      try {
          const tipoHabitacion = await prisma.tipoHabitacion.upsert({
            where: { categoriaId_ocupacionId_nombre: { categoriaId, ocupacionId, nombre: data.name } },
            update: {
              descripcion: data.description,
              tarifaBase: data.price,
            },
            create: {
              nombre: data.name,
              descripcion: data.description,
              tarifaBase: data.price,
              categoria: { connect: { id: categoriaId } },
              ocupacion: { connect: { id: ocupacionId } },
              imagenes: { create: imagenesData },
              amenidades: {
                create: amenidadesIds.map(id => ({
                  amenidad: { connect: { id: id } }
                }))
              }
            },
            include: { categoria: true, ocupacion: true },
          });
          console.log(`  -> Creado/Verificado TipoHabitacion: ${tipoHabitacion.nombre} (Cat: ${tipoHabitacion.categoria.nombre}, Ocu: ${tipoHabitacion.ocupacion.nombre})`);
      } catch (error) {
           console.error(`  -> ERROR creando/actualizando TipoHabitacion '${data.name}':`, error.message);
      }
  }
  // --- FIN DEL CÓDIGO PARA DELUXE ---

  // ⬇️⬇️ 2. ESTE ES EL LOOP NUEVO ⬇️⬇️
  for (const data of habitacionesMockSuite) {
      const categoriaId = findIdByName(categoriasDB, data.category);
      const ocupacionId = findIdByName(ocupacionesDB, data.ocupacionNombreExacto);

      if (!categoriaId || !ocupacionId) {
        console.warn(`  -> WARN: No se encontró Categoría ('${data.category}') u Ocupación ('${data.ocupacionNombreExacto}') para '${data.name}'. Saltando...`);
        continue;
      }

      // Define qué amenidades incluye la categoría Suite (¡AJUSTA ESTO!)
      // (Asegúrate que estos nombres existan en tu tabla Amenidad)
      let amenidadesNombres = [
          'Baño privado con ducha', 'TV LCD de 30" a 43" con cable',
          'Wi-Fi de Alta Velocidad',
          'Aire Acondicionado SPLIT', 'Frigobar', 'Calefacción Central',
          'Secador de Pelo', 'Teléfono DDI - DDN',
          'Cerradura con tarjeta de proximidad', 'Caja Individual de Seguridad Digital',
          'Escritorio de Trabajo', 'Silla Ergonómica', 'Cafetera Nespresso',
          // Amenidades específicas de Suite (Descomenta/Añade las que creaste):
          // 'Jacuzzi',
          // 'Balcón Privado',
          // 'Sala de Estar Separada',
        ];
        // Lógica específica si alguna Suite tiene amenidades únicas
        if (data.name === 'Suite Legado') {
            // amenidadesNombres.push('Cocina Gourmet'); // Si creaste esta amenidad
        }
        if (data.name === 'Suite Cumbre' || data.name === 'Suite Nupcial') {
            // amenidadesNombres.push('Jacuzzi', 'Balcón Privado');
        }

      const amenidadesIds = findAmenidadIdsByNames(amenidadesNombres);
       if (amenidadesIds.length !== amenidadesNombres.length) {
         console.warn(`  -> WARN: No se encontraron todas las amenidades para '${data.name}'. Verifica los nombres en la lista 'amenidadesNombres'.`)
       }

      // Construye el array de imágenes con las URLs
      const imagenesData = [];
      if (data.image1 && data.image1.startsWith('http')) imagenesData.push({ url: data.image1 });
      if (data.image2 && data.image2.startsWith('http')) imagenesData.push({ url: data.image2 });

      try {
          const tipoHabitacion = await prisma.tipoHabitacion.upsert({
            where: { categoriaId_ocupacionId_nombre: { categoriaId, ocupacionId, nombre: data.name } },
            update: {
              descripcion: data.description,
              tarifaBase: data.price,
            },
            create: {
              nombre: data.name,
              descripcion: data.description,
              tarifaBase: data.price,
              categoria: { connect: { id: categoriaId } },
              ocupacion: { connect: { id: ocupacionId } },
              imagenes: { create: imagenesData },
              amenidades: {
                create: amenidadesIds.map(id => ({
                  amenidad: { connect: { id: id } }
                }))
              }
            },
            include: { categoria: true, ocupacion: true },
          });
          console.log(`  -> Creado/Verificado TipoHabitacion: ${tipoHabitacion.nombre} (Cat: ${tipoHabitacion.categoria.nombre}, Ocu: ${tipoHabitacion.ocupacion.nombre})`);
      } catch (error) {
           console.error(`  -> ERROR creando/actualizando TipoHabitacion '${data.name}':`, error.message);
      }
  }
  // --- FIN DEL CÓDIGO PARA SUITE ---

  console.log(`\nSeeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });