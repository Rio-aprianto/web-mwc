export default function Footer() {
  return (
    <footer className='bg-emerald-950 text-white'>
      {/* Bagian Utama Konten Footer */}
      <div className='mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-3'>
        <div>
          <h3 className='text-2xl font-bold'>MWC NU Karanganyar</h3>
          <p className='mt-4 text-emerald-100/70'>
            Melayani umat dan menguatkan jam'iyyah Nahdlatul Ulama.
          </p>
        </div>

        <div>
          <h4 className='font-semibold mb-4'>Banom</h4>
          <ul className='space-y-2 text-emerald-100/80'>
            <li>Muslimat Karanganyar</li>
            <li>GP Ansor Karanganyar</li>
            <li>Fatayat Karanganyar</li>
            <li>IPNU IPPNU Karanganyar</li>
            <li>Pergunu Karanganyar</li>
          </ul>
        </div>

        <div>
          <h4 className='font-semibold mb-4'>Kontak</h4>
          <div className='space-y-1 text-emerald-100/80 mb-4'>
            <p>Karanganyar, Pekalongan</p>
            <p>info@mwcnu.or.id</p>
          </div>

          {/* Google Maps Embed */}
          <div className='w-full overflow-hidden rounded-lg border border-emerald-900/50 shadow-md'>
            <iframe
              src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d247.48967382396418!2d109.62502330541608!3d-7.028697784276716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e701fc6888a2897%3A0xc6699e093bf77532!2sKANTOR%20SEKRETARIAT%20MWC%20NU%20KEC.%20KARANGANYAR!5e0!3m2!1sid!2sid!4v1782133721218!5m2!1sid!2sid'
              className='w-full h-40'
              style={{ border: 0 }}
              allowFullScreen={true}
              loading='lazy'
              referrerPolicy='no-referrer-when-downgrade'
            />
          </div>
        </div>
      </div>

      {/* Bagian Bawah (Bottom Bar) */}
      <div className='border-t border-emerald-900 bg-emerald-950/40 py-6 text-center text-sm text-emerald-100/60'>
        <div className='space-y-1'>
          <p className='font-medium'>
            &copy; {new Date().getFullYear()} nucarekaranganyar
          </p>
          <p className='text-xs opacity-80'>
            Supported by{" "}
            <span className='font-semibold text-emerald-200'>
              <a
                href='https://portfolio-rioaprianto-my-id.vercel.app/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-emerald-200 hover:underline'>
                Rio Aprianto
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
